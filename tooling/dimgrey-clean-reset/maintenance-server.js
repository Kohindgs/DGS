const http = require("http");

const port = parseInt(process.env.PORT || "3000", 10);
const body = [
  "<!DOCTYPE html>",
  "<html lang=\"en\">",
  "<head>",
  "<meta charset=\"utf-8\"/>",
  "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/>",
  "<meta name=\"robots\" content=\"noindex,nofollow\"/>",
  "<title>Dimgrey Staging - Maintenance</title>",
  "<style>",
  "body{margin:0;min-height:100vh;display:grid;place-items:center;background:#020202;color:#f0f2f5;font:16px/1.6 Manrope,system-ui,sans-serif}",
  "main{max-width:42rem;padding:2rem;text-align:center}",
  "h1{font-size:1.5rem;margin:0 0 .75rem}",
  "p{color:#9ca3af;margin:0}",
  "</style>",
  "</head>",
  "<body>",
  "<main>",
  "<h1>Dimgrey staging reset in progress</h1>",
  "<p>The previous mixed deployment was archived. A fresh WordPress mirror build will be deployed from GitHub after local QA passes.</p>",
  "</main>",
  "</body>",
  "</html>",
].join("");

http
  .createServer((req, res) => {
    res.writeHead(503, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      "CDN-Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Retry-After": "3600",
    });
    res.end(body);
  })
  .listen(port, () => {
    console.log("Dimgrey maintenance mode on", port);
  });
