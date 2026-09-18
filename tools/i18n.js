// i18n helper for the static site.
//   node tools/i18n.js extract   → tools/i18n-strings.json (every translatable string of index.html, in order)
//   node tools/i18n.js build     → en/index.html from index.html + tools/i18n-en.json (ES → EN dictionary)
// Translatable: text nodes (outside <script>/<style>, including SVG <text>), attributes alt / aria-label /
// title / placeholder / content (meta), <title>, and the JSON-LD block. Whitespace-only nodes are ignored.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const mode = process.argv[2] || "extract";
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const SKIP_TAGS = new Set(["script", "style"]);
const ATTRS = ["alt", "aria-label", "title", "placeholder", "content"];
const norm = (s) => s.replace(/\s+/g, " ").trim();
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const encode = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const encodeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

// tokenizer: returns [{type:'tag'|'text'|'comment', raw, name, closing}]
function tokenize(src) {
  const out = []; let i = 0;
  while (i < src.length) {
    if (src.startsWith("<!--", i)) { const e = src.indexOf("-->", i) + 3; out.push({ type: "comment", raw: src.slice(i, e) }); i = e; continue; }
    if (src[i] === "<") {
      let e = i + 1, inQ = null;
      for (; e < src.length; e++) { const c = src[e]; if (inQ) { if (c === inQ) inQ = null; } else if (c === '"' || c === "'") inQ = c; else if (c === ">") break; }
      const raw = src.slice(i, e + 1);
      const m = raw.match(/^<\/?([a-zA-Z][\w-]*)/);
      out.push({ type: "tag", raw, name: m ? m[1].toLowerCase() : "", closing: raw.startsWith("</") });
      i = e + 1; continue;
    }
    const e = src.indexOf("<", i); const end = e < 0 ? src.length : e;
    out.push({ type: "text", raw: src.slice(i, end) }); i = end;
  }
  return out;
}

const tokens = tokenize(html);
const strings = []; // {kind, text, ctx}
let skipDepth = 0, jsonLd = false, pathStack = [];
const dict = mode === "build" ? JSON.parse(fs.readFileSync(path.join(__dirname, "i18n-en.json"), "utf8")) : null;
const missing = new Set();
const tr = (s) => { if (!dict) return s; if (dict[s] !== undefined) return dict[s]; missing.add(s); return s; };

let out = "";
for (const t of tokens) {
  if (t.type === "comment") { out += t.raw; continue; }
  if (t.type === "tag") {
    if (SKIP_TAGS.has(t.name)) {
      if (!t.closing) { skipDepth++; jsonLd = /application\/ld\+json/.test(t.raw); } else { skipDepth--; jsonLd = false; }
      out += t.raw; continue;
    }
    if (skipDepth > 0) { out += t.raw; continue; }
    if (!t.closing) pathStack.push(t.name); else pathStack.pop();
    // attributes
    let raw = t.raw;
    for (const a of ATTRS) {
      raw = raw.replace(new RegExp(`(\\s${a}=")([^"]*)(")`), (m, p1, v, p3) => {
        const val = decode(v); if (!norm(val)) return m;
        if (a === "content" && !/name="(description|twitter:[a-z:]+)"|property="og:(title|description|site_name)"/.test(t.raw)) return m;
        strings.push({ kind: "attr:" + a, text: val, ctx: t.name });
        return p1 + encodeAttr(tr(val)) + p3;
      });
    }
    out += raw; continue;
  }
  // text
  if (skipDepth > 0 && !jsonLd) { out += t.raw; continue; }
  if (jsonLd) {
    // translate JSON string values that are prose (description / name of features)
    out += t.raw.replace(/"(description|name)": "([^"]+)"/g, (m, k, v) => { strings.push({ kind: "jsonld", text: v, ctx: k }); return `"${k}": "${tr(v)}"`; });
    continue;
  }
  const text = t.raw; const n = norm(decode(text));
  if (!n) { out += text; continue; }
  const parent = pathStack[pathStack.length - 1];
  strings.push({ kind: "text", text: n, ctx: pathStack.slice(-2).join(">") });
  if (dict) { const lead = text.match(/^\s*/)[0], tail = text.match(/\s*$/)[0]; out += lead + encode(tr(n)) + tail; }
}

if (mode === "extract") {
  const seen = new Map();
  for (const s of strings) if (!seen.has(s.text)) seen.set(s.text, s);
  fs.writeFileSync(path.join(__dirname, "i18n-strings.json"), JSON.stringify([...seen.values()], null, 2));
  console.log("strings:", strings.length, "unique:", seen.size);
} else {
  // EN page lives in /en/: fix relative paths, lang, canonical/og, language switches, burger labels
  const swaps = [
    ['<html lang="es">', '<html lang="en">'],
    ['<link rel="canonical" href="https://passage-amador.vercel.app/">', '<link rel="canonical" href="https://passage-amador.vercel.app/en/">'],
    ['<meta property="og:url" content="https://passage-amador.vercel.app/">', '<meta property="og:url" content="https://passage-amador.vercel.app/en/">'],
    ['<meta property="og:locale" content="es_PA">', '<meta property="og:locale" content="en_US">'],
    ['<meta property="og:locale:alternate" content="en_US">', '<meta property="og:locale:alternate" content="es_PA">'],
    ['"url": "https://passage-amador.vercel.app/"', '"url": "https://passage-amador.vercel.app/en/"'],
    ['<a href="en/" class="nav__lang" aria-label="Switch to English" lang="en" hreflang="en"><span class="is-on">ES</span><i>/</i><span>EN</span></a>', '<a href="../" class="nav__lang" aria-label="Cambiar a español" lang="es" hreflang="es"><span>ES</span><i>/</i><span class="is-on">EN</span></a>'],
    ['<a href="en/" class="nav__lang" lang="en" hreflang="en"><span class="is-on">ES</span><i>/</i><span>EN</span></a>', '<a href="../" class="nav__lang" lang="es" hreflang="es"><span>ES</span><i>/</i><span class="is-on">EN</span></a>'],
    ['<a href="en/" class="footer__lang" lang="en" hreflang="en"><span class="is-on">ES</span> / <span>EN</span></a>', '<a href="../" class="footer__lang" lang="es" hreflang="es"><span>ES</span> / <span class="is-on">EN</span></a>'],
    ['<a href="en/" class="nav__lang nav__lang--mobile" aria-label="Switch to English" lang="en" hreflang="en"><span class="is-on">ES</span><i>/</i><span>EN</span></a>', '<a href="../" class="nav__lang nav__lang--mobile" aria-label="Cambiar a español" lang="es" hreflang="es"><span>ES</span><i>/</i><span class="is-on">EN</span></a>'],
    ['data-label-open="Abrir menú" data-label-close="Cerrar menú"', 'data-label-open="Open menu" data-label-close="Close menu"'],
  ];
  let en = out.replace(/(href|src)="(img\/|styles\.css|main\.js)/g, '$1="../$2').replace(/srcset="img\//g, 'srcset="../img/');
  for (const [from, to] of swaps) { if (!en.includes(from)) console.warn("swap not found:", from.slice(0, 60)); en = en.replace(from, to); }
  fs.mkdirSync(path.join(root, "en"), { recursive: true });
  fs.writeFileSync(path.join(root, "en", "index.html"), en);
  console.log("en/index.html written;", "missing translations:", missing.size);
  if (missing.size) console.log([...missing].map((s) => "  - " + s).join("\n"));
}
