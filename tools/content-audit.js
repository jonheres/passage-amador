// Generates CONTENT-AUDIT.md: every visible text, link, form field, image alt and meta of index.html, in page order.
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

const out = [];
const meta = (name) => { const m = html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`)); return m ? decode(m[1]) : ""; };
out.push("# Passage Amador — Auditoría de contenido");
out.push(`Generado: ${new Date().toISOString().slice(0, 16).replace("T", " ")} · Fuente: index.html · Espejo: https://jonheres.github.io/passage-amador/`);
out.push("");
out.push("## Metadatos");
out.push(`- **title:** ${decode(html.match(/<title>([^<]*)<\/title>/)[1])}`);
out.push(`- **description:** ${meta("description")}`);
out.push(`- **og:title:** ${meta("og:title")}`);
out.push(`- **og:description:** ${meta("og:description")}`);
out.push(`- **og:image:** ${meta("og:image")}`);
out.push(`- **lang:** es · **tipografía:** Inter Tight (300/400/500)`);

const body = html.slice(html.indexOf("<body>"));
const tokens = body.split(/(<[^>]+>)/).filter((t) => t !== "");
const skipTags = new Set(["script", "style", "defs", "mask", "pattern", "symbol", "svg"]);
const inlineTags = new Set(["span", "b", "i", "em", "strong", "small", "br", "picture", "source", "u", "sup"]);
let skipDepth = 0, section = "Global", buffer = "", link = null;
const items = [];
const flush = () => {
  const txt = decode(buffer); buffer = "";
  if (link) { link.text = txt; items.push(link); link = null; return; }
  if (txt) items.push({ section, kind: "TEXT", text: txt });
};
for (let i = 0; i < tokens.length; i++) {
  const t = tokens[i];
  if (t.startsWith("<!--")) { const m = t.match(/<!-- =+ (.+?) =+ -->/); if (m) { flush(); section = m[1].trim(); items.push({ section, kind: "SECTION" }); } continue; }
  if (t.startsWith("<")) {
    const tag = (t.match(/^<\/?([a-zA-Z0-9-]+)/) || [])[1]?.toLowerCase();
    if (!tag) continue;
    const closing = t.startsWith("</"), selfClosing = t.endsWith("/>");
    if (skipTags.has(tag)) { if (!selfClosing) skipDepth += closing ? -1 : 1; continue; }
    if (skipDepth > 0) continue;
    const g = (a) => (t.match(new RegExp(`\\b${a}="([^"]*)"`)) || [])[1];
    if (tag === "img") { if (!link) flush(); items.push({ section, kind: "IMG", src: g("src"), alt: g("alt") ? decode(g("alt")) : "(decorativa)" }); continue; }
    if (tag === "input") { flush(); items.push({ section, kind: "FIELD", type: g("type"), name: g("name"), id: g("id"), required: /\brequired\b/.test(t), autocomplete: g("autocomplete") }); continue; }
    if (tag === "textarea" && !closing) { flush(); items.push({ section, kind: "FIELD", type: "textarea", name: g("name"), id: g("id"), required: /\brequired\b/.test(t) }); continue; }
    if (tag === "select" && !closing) { flush(); items.push({ section, kind: "FIELD", type: "select", name: g("name"), id: g("id"), required: /\brequired\b/.test(t), options: [] }); continue; }
    if (tag === "option") { if (!closing) { const sel = [...items].reverse().find((x) => x.kind === "FIELD" && x.type === "select"); sel.options.push({ value: g("value"), text: decode(tokens[i + 1] || ""), disabled: /disabled/.test(t) }); } buffer = ""; continue; }
    if (tag === "label") { if (!closing) { flush(); buffer = ""; } else { items.push({ section, kind: "LABEL", text: decode(buffer) }); buffer = ""; } continue; }
    if (tag === "button") { if (!closing) { flush(); buffer = ""; link = null; items.push({ section, kind: "BUTTON", text: decode(g("aria-label") || ""), pending: true }); } else { const b = [...items].reverse().find((x) => x.kind === "BUTTON" && x.pending); b.text = decode(buffer) || b.text; delete b.pending; buffer = ""; } continue; }
    if (tag === "a") { if (!closing) { flush(); link = { section, kind: "LINK", href: g("href"), target: g("target"), aria: g("aria-label") }; } else { flush(); } continue; }
    if (inlineTags.has(tag)) { if (tag === "br") buffer += " "; else if (!closing && ["small", "em", "i"].includes(tag) && buffer && !/\s$/.test(buffer)) buffer += " · "; continue; }
    // block tag boundary
    flush();
    continue;
  }
  if (skipDepth > 0) continue;
  buffer += " " + t;
}
flush();

for (const it of items) {
  if (it.kind === "SECTION") { out.push(""); out.push(`## ${it.section}`); out.push(""); continue; }
  if (it.kind === "TEXT") out.push(`- ${it.text}`);
  else if (it.kind === "LINK") out.push(`- 🔗 "${it.text || it.aria || "(logo)"}" → \`${it.href}\`${it.target ? " (nueva pestaña)" : ""}`);
  else if (it.kind === "BUTTON") out.push(`- 🔘 Botón: "${it.text}"`);
  else if (it.kind === "LABEL") out.push(`- 🏷️ Label: ${it.text}`);
  else if (it.kind === "FIELD") { out.push(`- 📝 Campo \`${it.name}\` · ${it.type} · id=${it.id} · ${it.required ? "**obligatorio**" : "opcional"}${it.autocomplete ? ` · autocomplete=${it.autocomplete}` : ""}`); if (it.options) it.options.forEach((o) => out.push(`  - \`${o.value || "(vacío)"}\` → "${o.text}"${o.disabled ? " (placeholder)" : ""}`)); }
  else if (it.kind === "IMG") out.push(`- 🖼️ \`${it.src}\` — alt: ${it.alt}`);
}

const mapTexts = [...html.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].map((m) => decode(m[1])).filter(Boolean);
out.push(""); out.push("## Etiquetas del mapa (SVG)"); out.push(""); out.push("- " + [...new Set(mapTexts)].join(" · "));

out.push(""); out.push("## Formulario — resumen para CRM"); out.push("");
out.push("| Label | name | id | Tipo | Obligatorio | Notas |");
out.push("|---|---|---|---|---|---|");
const fields = items.filter((x) => x.kind === "FIELD"), labels = items.filter((x) => x.kind === "LABEL");
fields.forEach((f, i) => {
  const notes = f.type === "select" ? "valores: " + f.options.filter((o) => !o.disabled).map((o) => o.value).join(", ") : (f.autocomplete ? `autocomplete=${f.autocomplete}` : "");
  out.push(`| ${labels[i] ? labels[i].text : ""} | \`${f.name}\` | \`${f.id}\` | ${f.type} | ${f.required ? "sí" : "no"} | ${notes} |`);
});
out.push("");
out.push("**Comportamiento actual:** sin backend; `main.js` valida los obligatorios y muestra `#formSuccess`. Las filas de Tipologías (`data-interes`) preseleccionan el `select` de interés. Botones: **Solicitar información** (submit) y **Contactar por WhatsApp** (enlace `wa.me`).");
out.push("");
out.push("## Pendientes / placeholders");
out.push("");
const ph = [...new Set([...html.matchAll(/\[[^\]\n]{3,120}\]/g)].map((m) => m[0]))];
ph.forEach((p) => out.push(`- ${p}`));
out.push("- Número de WhatsApp (`wa.me/50760000000`), correo de ventas (`ventas@passagepanama.com`), páginas legales (`#privacidad`, `#cookies`, `#terminos`), versión EN (switch visible, sin contenido).");

fs.writeFileSync(path.join(__dirname, "..", "CONTENT-AUDIT.md"), out.join("\n"), "utf8");
console.log("CONTENT-AUDIT.md", out.length, "lines");
