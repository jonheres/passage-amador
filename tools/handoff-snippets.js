// Regenerates handoff/snippets/* from index.html and en/index.html:
// one HTML file per section and language (ready to paste in an Elementor HTML widget),
// the map SVG on its own (ES/EN) and the shared ornament <defs>.
//   node tools/handoff-snippets.js
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const out = path.join(root, "handoff", "snippets");
fs.mkdirSync(out, { recursive: true });
const names = { NAV: "00-nav-y-menu-movil", "01 HERO": "01-hero", "02 INTRO": "02-intro", "03 UBICACIÓN": "03-ubicacion-mapa", "04 RESIDENCIAS": "04-residencias", "05 TIPOLOGÍAS": "05-tipologias", "06 AMENIDADES": "06-amenidades", "07 ARQUITECTURA": "07-arquitectura", "08 GALERÍA": "08-galeria", "09 PREGUNTAS": "09-preguntas-faq", "10 PROYECTO": "10-proyecto", "11 CONTACTO": "11-contacto", FOOTER: "12-footer" };
for (const [lang, file] of [["es", "index.html"], ["en", "en/index.html"]]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const re = /<!-- ((?:NAV|FOOTER|\d\d [A-ZÁÉÍÓÚÑ ]+?)) — [\s\S]*?-->/g;
  const marks = []; let m;
  while ((m = re.exec(html))) marks.push({ name: m[1].trim(), start: m.index, end: m.index + m[0].length });
  marks.forEach((mk, i) => {
    const next = marks[i + 1];
    let body = html.slice(mk.end, next ? next.start : html.indexOf("</footer>") + 9);
    if (mk.name === "NAV") body = body.replace(/\n<!-- Símbolo reutilizable[\s\S]*$/, "\n"); // defs go in their own file
    if (mk.name === "11 CONTACTO") body = body.replace(/\n<\/main>\s*$/, "\n");
    if (mk.name === "FOOTER") body = html.slice(mk.end, html.indexOf("</footer>") + 9);
    fs.writeFileSync(path.join(out, `${names[mk.name]}.${lang}.html`), html.slice(mk.start, mk.end) + "\n" + body.trim() + "\n");
  });
  const svg = html.match(/<svg viewBox="0 0 900 891"[\s\S]*?<\/svg>/)[0];
  fs.writeFileSync(path.join(out, `mapa-amador.${lang}.svg`), svg + "\n");
}
const es = fs.readFileSync(path.join(root, "index.html"), "utf8");
fs.writeFileSync(path.join(out, "ornamento-defs.html"), es.match(/<!-- Símbolo reutilizable[\s\S]*?<\/svg>/)[0] + "\n");
console.log("snippets:", fs.readdirSync(out).length);
