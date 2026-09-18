// Consolidates styles.css (written in successive rounds) into one clean, ordered stylesheet.
// - parses rules (incl. @media / @supports / @keyframes)
// - drops declarations that a later rule with the *same selector in the same context* overrides
// - merges the surviving declarations of repeated selectors
// - regroups by component, base rules first and media queries after, keeping relative order
// Output: styles.consolidated.css (verified against the original with tools/css-verify.js)
const fs = require("fs");
const path = require("path");
// Input: the legacy, round-by-round stylesheet kept at recursos/_unused/styles.legacy.css. Output: styles.consolidated.css
const src = fs.readFileSync(path.join(__dirname, "..", "recursos", "_unused", "styles.legacy.css"), "utf8");

// ---------- parse ----------
function parse(css) {
  const nodes = [];
  let i = 0;
  const skipWs = () => { while (i < css.length && /\s/.test(css[i])) i++; };
  const readUntil = (chars) => { let s = ""; let depth = 0; while (i < css.length) { const c = css[i]; if (c === "(") depth++; if (c === ")") depth--; if (depth === 0 && chars.includes(c)) break; s += c; i++; } return s; };
  const readBlock = () => { // assumes css[i] === '{'; returns inner text with balanced braces
    let depth = 0, start = i + 1;
    for (; i < css.length; i++) { if (css[i] === "{") depth++; else if (css[i] === "}") { depth--; if (depth === 0) { const inner = css.slice(start, i); i++; return inner; } } }
    throw new Error("unbalanced");
  };
  while (i < css.length) {
    skipWs(); if (i >= css.length) break;
    if (css.startsWith("/*", i)) { const e = css.indexOf("*/", i); nodes.push({ type: "comment", text: css.slice(i + 2, e).trim() }); i = e + 2; continue; }
    if (css[i] === "@") {
      const head = readUntil("{;").trim();
      if (css[i] === ";") { i++; nodes.push({ type: "atstmt", text: head }); continue; }
      const inner = readBlock();
      const name = head.split(/\s/)[0];
      if (name === "@keyframes" || name === "@font-face") nodes.push({ type: "raw", head, body: inner.trim() });
      else nodes.push({ type: "at", head, children: parse(inner) });
      continue;
    }
    const sel = readUntil("{").trim();
    const body = readBlock();
    nodes.push({ type: "rule", sel: sel.replace(/\s*,\s*/g, ", ").replace(/\s+/g, " "), decls: parseDecls(body) });
  }
  return nodes;
}
function parseDecls(body) {
  const out = []; let cur = ""; let depth = 0; let inStr = null;
  const push = () => { const t = cur.trim(); cur = ""; if (!t) return; const k = t.indexOf(":"); if (k < 0) return; const prop = t.slice(0, k).trim(); let val = t.slice(k + 1).trim(); const imp = /!important$/.test(val); if (imp) val = val.replace(/\s*!important$/, ""); out.push({ prop, val, imp }); };
  for (const c of body) {
    if (inStr) { cur += c; if (c === inStr) inStr = null; continue; }
    if (c === '"' || c === "'") { inStr = c; cur += c; continue; }
    if (c === "(") depth++; if (c === ")") depth--;
    if (c === ";" && depth === 0) { push(); continue; }
    cur += c;
  }
  push();
  return out;
}

// ---------- flatten into (context, rule) list ----------
const flat = []; // {ctx: [at heads...], sel, decls, order}
const raws = [];
let order = 0;
function walk(nodes, ctx) {
  for (const n of nodes) {
    // selector lists are split so every selector is cascaded on its own ("A, B {d}" ≡ "A {d} B {d}")
    if (n.type === "rule") { const o = order++; n.sel.split(/,\s*/).forEach((sel) => flat.push({ ctx, sel, decls: n.decls.map((d) => ({ ...d })), order: o })); }
    else if (n.type === "at") walk(n.children, ctx.concat(n.head.replace(/\s+/g, " ").replace(/\(\s*/g, "(").replace(/\s*\)/g, ")").replace(/:\s*/g, ": ")));
    else if (n.type === "raw") { if (!raws.some((r) => r.head === n.head)) raws.push(n); else raws[raws.findIndex((r) => r.head === n.head)] = n; }
  }
}
walk(parse(src), []);

// A later shorthand overrides an earlier longhand of the same family (padding → padding-top, grid-area → grid-column…)
const FAMILIES = { padding: /^padding-/, margin: /^margin-/, border: /^border-/, "border-radius": /^border-.*-radius$/, background: /^background-/, font: /^(font-|line-height$)/, inset: /^(top|right|bottom|left)$/, flex: /^flex-(grow|shrink|basis)$/, gap: /^(row|column)-gap$/, overflow: /^overflow-[xy]$/, "grid-area": /^grid-(row|column)/, "grid-column": /^grid-column-/, "grid-row": /^grid-row-/, "grid-template": /^grid-template-/, grid: /^grid-/, transition: /^transition-/, animation: /^animation-/, "place-items": /^(align|justify)-items$/, "place-content": /^(align|justify)-content$/, "place-self": /^(align|justify)-self$/, mask: /^mask-/, "-webkit-mask": /^-webkit-mask-/, "text-decoration": /^text-decoration-/, outline: /^outline-/, columns: /^column-(width|count)$/ };
const overrides = (later, earlier) => later.prop === earlier.prop || (FAMILIES[later.prop] && FAMILIES[later.prop].test(earlier.prop));

// ---------- dedupe overridden declarations (same ctx + same selector) ----------
const ctxKey = (r) => r.ctx.join(" | ");
for (let a = 0; a < flat.length; a++) {
  const ra = flat[a];
  for (let b = a + 1; b < flat.length; b++) {
    const rb = flat[b];
    if (rb.sel !== ra.sel || ctxKey(rb) !== ctxKey(ra)) continue;
    // any prop in ra that rb also declares (with >= importance) is dead
    ra.decls = ra.decls.filter((d) => !rb.decls.some((e) => overrides(e, d) && (e.imp || !d.imp)));
  }
  // also dedupe within the same rule (last wins)
  const seen = new Map(); ra.decls.forEach((d, idx) => seen.set(d.prop + (d.imp ? "!" : ""), idx));
  ra.decls = ra.decls.filter((d, idx) => seen.get(d.prop + (d.imp ? "!" : "")) === idx);
}
// A declaration inside a media query is also dead when a LATER base rule with the same selector sets the
// same property: in the original file the base rule won at every width (same specificity, later in source).
// Dropping it keeps the rendered result once media queries are regrouped after the base rules.
for (const ra of flat) {
  if (!ra.ctx.length) continue;
  for (const rb of flat) {
    const wider = !rb.ctx.length || (/max-width: 1100px/.test(ctxKey(rb)) && /max-width: 720px/.test(ctxKey(ra)));
    if (rb.order <= ra.order || !wider || rb.sel !== ra.sel) continue;
    ra.decls = ra.decls.filter((d) => !rb.decls.some((e) => overrides(e, d) && (e.imp || !d.imp)));
  }
}
const live = flat.filter((r) => r.decls.length);

// ---------- merge repeated selectors into their FIRST occurrence, cascade-safe ----------
// A declaration from a later copy moves up only if no rule in between (same context) declares the same
// property; otherwise it stays where it was, as its own rule. Moving a declaration earlier can only change
// the cascade if a competing declaration sits between the two positions, so this keeps the rendered result.
const merged = [];
for (const r of live) {
  const first = merged.find((m) => m.sel === r.sel && ctxKey(m) === ctxKey(r) && !m.split);
  if (!first) { merged.push({ ...r, decls: r.decls.slice() }); continue; }
  const between = live.filter((x) => ctxKey(x) === ctxKey(r) && x.order > first.order && x.order < r.order);
  const stay = [], move = [];
  for (const d of r.decls) (between.some((x) => x.decls.some((e) => e.prop === d.prop)) ? stay : move).push(d);
  first.decls = first.decls.concat(move);
  if (stay.length) merged.push({ ...r, decls: stay, split: true });
}
merged.sort((x, y) => x.order - y.order);

// ---------- drop selectors that match nothing in the final DOM (list produced in-browser, see css-verify.js) ----------
const dead = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, "qa-dead.json"), "utf8")));
for (const r of merged) r.sel = r.sel.split(/,\s*/).filter((s) => !dead.has(s)).join(", ");
// Manual, verified fixes for cross-selector cascade changes introduced by regrouping media queries last:
// the tablet rule ".ledger { grid-column: 1 }" used to lose against the later base ".ledger--behind { grid-column: auto }".
for (const r of merged) if (r.sel === ".ledger" && /max-width: 1100px/.test(ctxKey(r))) r.sel = ".residences .ledger";
// the phone rule ".orn { opacity: .55 }" (gallery ornaments) used to lose against the later base ".orn-contact { opacity: .09 }".
{ const m = merged.find((r) => r.sel === ".orn" && /max-width: 720px/.test(ctxKey(r))); if (m) merged.push({ ctx: m.ctx, sel: ".orn-contact", decls: [{ prop: "opacity", val: ".09", imp: false }], order: m.order + 0.5 }); }
// Media-query rules no longer need !important now that they come after the base rules (verified in-browser).
for (const r of merged) if (r.ctx.length && !/^.map|^.location__map/.test(r.sel)) r.decls.forEach((d) => { d.imp = false; });
const kept = merged.filter((r) => r.sel);
merged.length = 0; merged.push(...kept);

// ---------- component grouping ----------
const groups = [
  ["Tokens, reset y tipografía compartida", /^(:root|\*|html|body|main|section|footer|img|a|h[1-6]|p|ul|ol|dl|dd|figure|address|::selection|#orn1-path|\.display|\.idx|\.idx-label|\.section-index|\.rule|\.eyebrow|\.lead|\.btn|\.reveal|\.reveal-lines|\.scroll-line|\.skip-link|\.svg-defs|\.orn|\.sr-only|\.visually-hidden)/],
  ["Nav + menú móvil", /^(\.nav|\.menu|body\.menu-open|\.burger)/],
  ["01 Hero", /^\.hero/],
  ["02 Intro", /^(\.intro|\.themes|\.theme|\.facts|\.keyline|\.panorama)/],
  ["03 Ubicación (mapa)", /^(\.location|\.map|\.destinations|\.dest|\.d-name|\.d-time)/],
  ["04 Residencias", /^(\.residences|\.res|\.ledger|\.iso)/],
  ["05 Tipologías", /^(\.types|\.type-row|\.type)/],
  ["06 Amenidades", /^(\.amenit)/],
  ["07 Arquitectura", /^(\.arch|\.swatches|\.edge)/],
  ["08 Galería (+ hilo)", /^(\.gallery|\.g\b|\.g-|\.g )/],
  ["09 Preguntas (FAQ)", /^\.faq/],
  ["10 Proyecto", /^\.behind/],
  ["11 Contacto + formulario", /^(\.contact|\.form|\.wa)/],
  ["12 Footer", /^\.footer/],
];
// Handoff notes printed above each component in the base context
const NOTES = JSON.parse(fs.readFileSync(path.join(__dirname, "css-notes.json"), "utf8"));
const groupOf = (sel) => { const first = sel.split(",")[0].trim(); const g = groups.findIndex(([, re]) => re.test(first)); return g < 0 ? groups.length : g; };

// ---------- emit ----------
const fmtDecl = (d) => `${d.prop}: ${d.val}${d.imp ? " !important" : ""};`;
const fmtRule = (r, indent = "") => { const one = r.decls.length <= 4 && r.decls.reduce((n, d) => n + d.val.length, 0) < 90; return one ? `${indent}${r.sel} { ${r.decls.map(fmtDecl).join(" ")} }` : `${indent}${r.sel} {\n${r.decls.map((d) => indent + "  " + fmtDecl(d)).join("\n")}\n${indent}}`; };

let out = `/* ==========================================================================
   PASSAGE AMADOR — hoja de estilos consolidada
   Generada por tools/css-consolidate.js a partir de las rondas de diseño y
   verificada píxel a píxel (estilos computados) con tools/css-verify.js.

   Estructura: tokens → componentes en orden de página → media queries
   (tablet ≤1100px, móvil ≤720px, desktop ≥1101px) → movimiento reducido.
   Tipografía: Inter Tight 300/400/500. Colores: sólo los tokens de :root.
   ========================================================================== */\n\n`;

const ctxs = [...new Set(merged.map(ctxKey))];
const ctxOrder = (k) => k === "" ? 0 : /max-width: 1100px/.test(k) ? 2 : /max-width: 720px/.test(k) ? 3 : /min-width: 1101px/.test(k) ? 1 : /reduced-motion/.test(k) ? 5 : 4;
ctxs.sort((a, b) => ctxOrder(a) - ctxOrder(b));

const sectionTitle = (k) => k === "" ? "BASE (desktop-first)" : k;
for (const k of ctxs) {
  const rules = merged.filter((r) => ctxKey(r) === k);
  out += `\n/* ==========================================================================\n   ${sectionTitle(k)}\n   ========================================================================== */\n`;
  const heads = k ? k.split(" | ") : [];
  const indent = "  ".repeat(heads.length);
  heads.forEach((h, i) => { out += "  ".repeat(i) + h + " {\n"; });
  const byGroup = new Map();
  for (const r of rules) { const g = groupOf(r.sel); if (!byGroup.has(g)) byGroup.set(g, []); byGroup.get(g).push(r); }
  for (const [g, rs] of [...byGroup.entries()].sort((a, b) => a[0] - b[0])) {
    const name = groups[g] ? groups[g][0] : "Otros";
    out += `\n${indent}/* ---------- ${name} ---------- */\n`;
    if (!k && NOTES[name]) out += `/* ${NOTES[name]} */\n`;
    // re-join consecutive rules that share the exact same declarations ("A {d} B {d}" → "A, B {d}")
    const joined = [];
    for (const r of rs) {
      const last = joined[joined.length - 1];
      const same = last && last.decls.length === r.decls.length && last.decls.every((d, i) => d.prop === r.decls[i].prop && d.val === r.decls[i].val && d.imp === r.decls[i].imp);
      if (same) last.sel += ", " + r.sel; else joined.push({ ...r });
    }
    out += joined.map((r) => fmtRule(r, indent)).join("\n") + "\n";
  }
  heads.forEach((h, i) => { out += "  ".repeat(heads.length - 1 - i) + "}\n"; });
}
out += `\n/* ==========================================================================\n   KEYFRAMES\n   ========================================================================== */\n`;
for (const r of raws) out += `${r.head} { ${r.body.replace(/\s+/g, " ")} }\n`;

fs.writeFileSync(path.join(__dirname, "..", "styles.consolidated.css"), out, "utf8");
console.log("rules in:", flat.length, "live:", live.length, "merged:", merged.length, "contexts:", ctxs.length, "bytes:", out.length);
console.log("ungrouped selectors:", [...new Set(merged.filter((r) => groupOf(r.sel) === groups.length).map((r) => r.sel))].join("\n  "));

// ---------- selector list for dead-rule detection in the browser (tools/css-verify.js) ----------
const clean = (s) => s
  .replace(/::?(before|after|picker-icon|checkmark|picker\([^)]*\)|selection|-webkit-scrollbar|-webkit-details-marker|marker|placeholder|file-selector-button|details-content)/g, "")
  .replace(/:(hover|focus|focus-visible|focus-within|active|open|checked|invalid|valid|placeholder-shown|user-invalid|visited|target)/g, "")
  .replace(/\.(is-open|is-active|is-hot|is-solid|is-on|in|has-error|is-done|menu-open|is-hidden)(?![\w-])/g, "")
  .replace(/\[open\]/g, "").trim();
const selList = [];
for (const r of merged) for (const s of r.sel.split(/,\s*/)) { const q = clean(s); if (q && !/^(html|body|:root|\*|selectedcontent)/.test(q) && !selList.some((x) => x.s === s)) selList.push({ s, q, ctx: ctxKey(r) }); }
fs.writeFileSync(path.join(__dirname, "qa-selectors.json"), JSON.stringify(selList));
console.log("selectors for QA:", selList.length);
