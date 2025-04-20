# 🔍 Exploring Superteam Earn Public APIs (For Educational Purposes Only)

This README documents publicly accessible APIs from the [Superteam Earn](https://earn.superteam.fun) platform. These endpoints were discovered using browser developer tools. This project is intended **strictly for educational purposes** — to understand how public APIs work, their potential vulnerabilities, and how developers can secure them.

---

## 📸 How APIs Were Found

Using the **Network tab** in browser DevTools, we can observe requests made when navigating the website. When actions like visiting a page or scrolling occur, network requests are triggered — and you can inspect those requests to see URLs, payloads, and responses.

### 📌 Screenshot: DevTools > Network > XHR or Fetch

📍 ![Network Tab](assets/console3.jpg)

![Network Tab](assets/console1.jpg)

---

## 📬 Sample API Requests & Responses

Below are examples of unauthenticated, publicly available APIs from Superteam Earn.

> You can test these directly in tools like **Postman** or **Insomnia**, no authentication is required.

### 📷 Screenshot: Postman with API Response Example

📍 ![Postman API Response](assets/postman1.jpg)

![Postman API Response](assets/postman2.jpg)

---

## 🧪 Observed Public APIs (So Far)

### 1. 🎯 Completed Listings

- **Endpoint:** https://earn.superteam.fun/api/homepage/listings/?order=desc&statusFilter=completed

- **Returns:** List of completed bounty projects with metadata like name, rewards, team, etc.
- **Response:** ![Postman API Response](assets/postman3.jpg)

---

### 2. 🌏 Grants by Region

- **Endpoint:** https://earn.superteam.fun/api/homepage/grants/?userRegion[]=INDIA&userRegion[]=GLOBAL&userRegion[]=India

- **Returns:** List of completed bounty projects with metadata like name, rewards, team, etc.
- **Response:** ![Postman API Response](assets/postman4.jpg)

---

### 3. 🧑‍💼 Recent Earners

- **Endpoint:** https://earn.superteam.fun/api/sidebar/recent-earners

- **Returns:** List of recent earners with usernames, profile icons, and task names.

---

### 4. 📰 Feed

- **Endpoint:** https://earn.superteam.fun/api/feed/home/
- **Returns:** Homepage feed containing recent and popular bounties.
- **Response:** ![Postman API Response](assets/postman1.jpg)

### 5. 📊 Sidebar Stats

- **Endpoint:** https://earn.superteam.fun/api/sidebar/stats
- **Returns:** Key platform stats (e.g., total earners, total payouts).

---

### 6. 📍 Live Listings Count (Region-specific)

- **Endpoint:** https://earn.superteam.fun/api/listings/region-live-count?region=india
- **Returns:** Number of active listings by region.

---

### 7. 🧠 Hackathon Stats (Breakout Example)

- **Endpoint:** https://earn.superteam.fun/api/hackathon/public-stats/?slug=breakout
- **Response:** ![Postman API Response](assets/postman5.jpg)

---

### 8. 🧑‍💻 Hackathon Details

- **Endpoint:** https://earn.superteam.fun/api/hackathon/?slug=breakout
- **Response:** ![Postman API Response](assets/postman6.jpg)

---

### 🔍 There are likely more endpoints accessible on different pages — many follow REST-style naming conventions.

---

## 🚨 Why This Can Be Risky for Any Platform

These APIs are **unauthenticated and exposed**, which can lead to several risks:

### ❗ 1. Unrestricted Scraping

- No API keys or authentication means anyone can hit these endpoints.
- This allows third parties to scrape and clone data easily.

### ❗ 2. DDoS or Bot Attacks

- Without rate limiting, sending thousands or millions of requests could overload the server and **cause a denial of service**.

### ❗ 3. Resource Cost & Abuse

- If users hit the endpoints excessively using automated scripts or rotating IPs, it increases server and bandwidth costs.

---

## 🧠 But Wait — Just Because It’s Public Doesn’t Mean It’s Open to Abuse

Websites **often intentionally expose public APIs** for frontend rendering, but responsible usage is key.

Here’s what can go wrong if exploited:

| Type of Exploit         | Description                                | Consequence                 |
| ----------------------- | ------------------------------------------ | --------------------------- |
| Bot scraping            | Collecting user data in bulk               | Privacy breach, data resale |
| API spamming            | Rapid requests using scripts               | Server strain or crash      |
| IP rotation & flooding  | Rotating proxy IPs to bypass rate limits   | May slow or bring site down |
| Cloning entire platform | Using scraped data to create copycat sites | Brand and trust loss        |

---

## 🛡️ How Developers Can Secure Public APIs

If you're building a site like this, here are some **best practices to follow**:

### ✅ 1. Authentication

- Use JWT, OAuth, or API keys even for general content.
- Even basic auth reduces misuse.

### ✅ 2. Rate Limiting

- Tools like:
- `express-rate-limit` (Node.js)
- Cloudflare rules
- API Gateway throttling

### ✅ 3. Bot Detection

- Google reCAPTCHA, hCaptcha, or invisible bot scoring

### ✅ 4. IP Throttling

- Block known proxy services or cloud datacenter IPs.
- Allow burst control per IP.

### ✅ 5. Obfuscate or Proxy Critical APIs

- Don’t expose internal service endpoints directly on frontend.

---

## 💡 Educational Purpose & Disclaimer

This README and the findings here are purely for learning purposes. **No harmful actions were taken** nor recommended. If you're from the Superteam Earn team and want this taken down or modified, feel free to open an issue or email me.

> 💬 Always be the dev who understands security — not the one who breaks trust.

---

## 🧨 `api-load-tester.js` – How This Script Could Potentially Take Down the Site

The file `api-load-tester.js` simulates heavy traffic by sending thousands of repeated requests to a public API endpoint.

While it is meant **only for educational and research purposes**, here's what could happen if this script — or a more aggressive version — were executed **at scale or maliciously**:

---

### 💥 Overwhelming Server Resources (Denial of Service)

- Each request consumes **CPU**, **RAM**, and **database operations** on the server.
- Rapid-fire requests (thousands or millions) can **slow down** or even **crash the backend**.
- When run from **multiple machines simultaneously**, it becomes a form of **Distributed Denial-of-Service (DDoS)**.

---

### 📡 Bandwidth Exhaustion

- If the APIs return large JSON payloads, they consume a lot of **bandwidth**.
- Constant access may increase **server costs** or breach hosting limits.
- This gets worse if **no caching or throttling** is in place.

---

### 🛢️ Database Strain

- If the API is not cached and pulls live data on every call:
  - It can overload the **database server** with **thousands of read queries per second**.
  - This affects other backend services relying on the same DB.

---

### 🚫 IP Bans or Cloudflare Blocks

- The server might temporarily or permanently **block** the IPs spamming requests.
- However, if the attacker uses **rotating proxies, VPNs, or a botnet**, it can bypass simple rate-limiting.
- Detecting and mitigating such patterns becomes **more complex**.

---

### 😖 Indirect Impact on Real Users

- Users may face:
  - Slow page loads
  - Incomplete or missing data
  - Inability to access the site at all
- This leads to **loss of trust**, poor UX, and **damaged brand reputation**.

---

## 👻 If This Were Done Maliciously (Theoretical Threats)

A bad actor could:

- 🔁 **Run the script from multiple IPs** (VPNs, botnets) to avoid blocks.
- 🎯 **Target different endpoints** in cycles to spread the load.
- ⏱️ **Schedule attacks** periodically (e.g. every hour) to keep systems unstable.
- 🚀 Use **concurrent requests** (e.g. via `Promise.all`, async queues, or multithreading) to maximize throughput per second.

> ⚠️ **This documentation is purely for educational awareness. Do NOT perform any of these actions without consent — doing so is unethical and illegal.**

---

### 🧠 Why This Matters

Understanding this behavior is not about hacking — it's about helping developers:

- Recognize vulnerabilities
- Build **stronger API defenses**
- Design with **security and scale in mind**

## 🙌 Final Thoughts

If you're a learner, ethical hacker, or web developer, use this as a case study to improve your understanding of:

- API design
- Security measures
- Responsible scraping
- Real-world web architecture

Let’s build **better**, not break what's working.

---
