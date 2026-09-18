// Minimal static server for local QA: node tools/serve.js [port]
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, ".."), port = +process.argv[2] || 8787;
const types = { html: "text/html; charset=utf-8", css: "text/css", js: "text/javascript", json: "application/json", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", svg: "image/svg+xml", webp: "image/webp" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const f = path.join(root, p);
  fs.readFile(f, (err, data) => { if (err) { res.writeHead(404); return res.end("not found"); } res.writeHead(200, { "Content-Type": types[path.extname(f).slice(1)] || "application/octet-stream", "Cache-Control": "no-store" }); res.end(data); });
}).listen(port, () => console.log("serving", root, "on http://localhost:" + port));
