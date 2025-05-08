const puppeteer = require("puppeteer");
const axios = require("axios");
const fs = require("fs");

// List of APIs to test
// const APIs = [
//   "https://earn.superteam.fun/api/homepage/listings/?order=desc&statusFilter=completed",
//   "https://earn.superteam.fun/api/homepage/grants/?userRegion[]=INDIA&userRegion[]=GLOBAL&userRegion[]=India",
//   "https://earn.superteam.fun/api/sidebar/recent-earners",
//   "https://earn.superteam.fun/api/feed/home/",
//   "https://earn.superteam.fun/api/sidebar/stats",
//   "https://earn.superteam.fun/api/listings/region-live-count?region=india",
//   "https://earn.superteam.fun/api/hackathon/public-stats/?slug=breakout",
//   "https://earn.superteam.fun/api/hackathon/?slug=breakout",
// ];

// Configuration options
const config = {
  // Test parameters
  concurrentRequests: 5, // Number of concurrent requests
  requestsPerBatch: 100, // Requests per API per batch
  delayBetweenBatches: 2000, // Delay between batches in ms
  totalBatches: 10, // Total number of batches to run

  // Output options
  logToConsole: true,
  logToFile: true,
  logFilePath: "./api-test-results.json",

  // Browser options (for Puppeteer)
  usePuppeteer: false, // Set to true to use Puppeteer instead of Axios
  headless: true,
};

// Results storage
const results = {
  summary: {
    startTime: null,
    endTime: null,
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    rateLimited: 0,
  },
  apiResults: {},
};

// Initialize results for each API
APIs.forEach((api) => {
  results.apiResults[api] = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    rateLimited: 0,
    responseTimesMs: [],
    errors: [],
  };
});

// Helper function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Make a request using Axios
 */
async function makeAxiosRequest(url) {
  const startTime = Date.now();
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "API-Testing-Tool/1.0",
        Accept: "application/json",
      },
      timeout: 10000, // 10 seconds timeout
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return {
      success: true,
      statusCode: response.status,
      responseTime,
      rateLimited: response.status === 429,
      data: response.data,
    };
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return {
      success: false,
      statusCode: error.response?.status || 0,
      responseTime,
      rateLimited: error.response?.status === 429,
      error: {
        message: error.message,
        code: error.code,
      },
    };
  }
}

/**
 * Make a request using Puppeteer
 */
async function makePuppeteerRequest(browser, url) {
  const startTime = Date.now();
  let page;

  try {
    page = await browser.newPage();

    // Set request interception to capture responses
    await page.setRequestInterception(true);

    let responseData = null;
    let statusCode = 0;

    page.on("request", (request) => {
      request.continue();
    });

    page.on("response", async (response) => {
      if (response.url() === url) {
        statusCode = response.status();
        try {
          responseData = await response.json();
        } catch (e) {
          // Not JSON or couldn't parse
        }
      }
    });

    await page.goto(url, { waitUntil: "networkidle0", timeout: 10000 });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    await page.close();

    return {
      success: statusCode >= 200 && statusCode < 300,
      statusCode,
      responseTime,
      rateLimited: statusCode === 429,
      data: responseData,
    };
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (page) await page.close();

    return {
      success: false,
      statusCode: 0,
      responseTime,
      rateLimited: false,
      error: {
        message: error.message,
        stack: error.stack,
      },
    };
  }
}

/**
 * Process the result of a request
 */
function processResult(api, result) {
  results.summary.totalRequests++;
  results.apiResults[api].totalRequests++;

  if (result.success) {
    results.summary.successfulRequests++;
    results.apiResults[api].successfulRequests++;
  } else {
    results.summary.failedRequests++;
    results.apiResults[api].failedRequests++;
    results.apiResults[api].errors.push({
      time: new Date().toISOString(),
      statusCode: result.statusCode,
      error: result.error,
    });
  }

  if (result.rateLimited) {
    results.summary.rateLimited++;
    results.apiResults[api].rateLimited++;
  }

  results.apiResults[api].responseTimesMs.push(result.responseTime);

  if (config.logToConsole) {
    console.log(
      `${api}: ${result.success ? "SUCCESS" : "FAILED"} - Status: ${
        result.statusCode
      } - Time: ${result.responseTime}ms${
        result.rateLimited ? " (RATE LIMITED)" : ""
      }`
    );
  }
}

/**
 * Calculate statistics and finalize results
 */
function finalizeResults() {
  results.summary.endTime = new Date().toISOString();

  // Calculate averages and percentiles for each API
  Object.keys(results.apiResults).forEach((api) => {
    const responseTimes = results.apiResults[api].responseTimesMs;
    if (responseTimes.length > 0) {
      // Sort response times for percentile calculations
      responseTimes.sort((a, b) => a - b);

      // Calculate statistics
      results.apiResults[api].stats = {
        minResponseTime: responseTimes[0],
        maxResponseTime: responseTimes[responseTimes.length - 1],
        avgResponseTime:
          responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length,
        medianResponseTime: responseTimes[Math.floor(responseTimes.length / 2)],
        p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)],
        p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)],
      };
    }
  });

  // Log summary to console
  if (config.logToConsole) {
    console.log("\n===== SUMMARY =====");
    console.log(`Total Requests: ${results.summary.totalRequests}`);
    console.log(`Successful Requests: ${results.summary.successfulRequests}`);
    console.log(`Failed Requests: ${results.summary.failedRequests}`);
    console.log(`Rate Limited Requests: ${results.summary.rateLimited}`);
    console.log("==================\n");

    // Log per-API statistics
    console.log("===== API STATISTICS =====");
    Object.keys(results.apiResults).forEach((api) => {
      const apiResult = results.apiResults[api];
      console.log(`\n${api}:`);
      console.log(`  Total: ${apiResult.totalRequests}`);
      console.log(`  Success: ${apiResult.successfulRequests}`);
      console.log(`  Failed: ${apiResult.failedRequests}`);
      console.log(`  Rate Limited: ${apiResult.rateLimited}`);

      if (apiResult.stats) {
        console.log("  Response Times:");
        console.log(`    Min: ${apiResult.stats.minResponseTime}ms`);
        console.log(`    Max: ${apiResult.stats.maxResponseTime}ms`);
        console.log(`    Avg: ${apiResult.stats.avgResponseTime.toFixed(2)}ms`);
        console.log(`    Median: ${apiResult.stats.medianResponseTime}ms`);
        console.log(`    P95: ${apiResult.stats.p95ResponseTime}ms`);
        console.log(`    P99: ${apiResult.stats.p99ResponseTime}ms`);
      }
    });
    console.log("=========================");
  }

  // Save results to file
  if (config.logToFile) {
    fs.writeFileSync(config.logFilePath, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to: ${config.logFilePath}`);
  }
}

/**
 * Main function to run the test
 */
async function runTest() {
  console.log("Starting API load test...");
  console.log(
    `Testing ${APIs.length} APIs with ${config.concurrentRequests} concurrent requests`
  );
  console.log(
    `Total of ${config.totalBatches} batches with ${config.requestsPerBatch} requests per API per batch`
  );
  console.log(`Delay between batches: ${config.delayBetweenBatches}ms`);
  console.log("----------------------------\n");

  results.summary.startTime = new Date().toISOString();

  let browser;
  if (config.usePuppeteer) {
    browser = await puppeteer.launch({
      headless: config.headless ? "new" : false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  // Run batches
  for (let batch = 1; batch <= config.totalBatches; batch++) {
    console.log(`Starting batch ${batch}/${config.totalBatches}`);

    // Prepare all requests for this batch
    const requests = [];

    for (const api of APIs) {
      for (let i = 0; i < config.requestsPerBatch; i++) {
        requests.push(async () => {
          const result = config.usePuppeteer
            ? await makePuppeteerRequest(browser, api)
            : await makeAxiosRequest(api);

          processResult(api, result);
        });
      }
    }

    // Execute requests with concurrency limit
    const executeWithConcurrency = async (tasks, concurrency) => {
      const results = [];
      const executing = new Set();

      for (const task of tasks) {
        const p = Promise.resolve().then(() => task());
        results.push(p);
        executing.add(p);

        const clean = () => executing.delete(p);
        p.then(clean).catch(clean);

        if (executing.size >= concurrency) {
          await Promise.race(executing);
        }
      }

      return Promise.all(results);
    };

    await executeWithConcurrency(requests, config.concurrentRequests);
    console.log(`Completed batch ${batch}/${config.totalBatches}`);

    // Delay between batches
    if (batch < config.totalBatches) {
      console.log(
        `Waiting ${config.delayBetweenBatches}ms before next batch...\n`
      );
      await delay(config.delayBetweenBatches);
    }
  }

  // Clean up
  if (browser) await browser.close();

  finalizeResults();
  console.log("Test completed!");
}

// Run the test
runTest().catch((error) => {
  console.error("Error running test:", error);
  process.exit(1);
});
