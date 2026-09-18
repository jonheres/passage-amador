// Browser-side helper for CSS regression checks (paste/eval in the page).
// window.qaSnapshot(label): hashes the computed style (+ ::before/::after) of every element
// after forcing "settled" state (reveals in, animations finished) and stores it in localStorage.
// window.qaCompare(labelA, labelB): returns the elements whose hash differs.
(function () {
  const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  const SKIP = new Set(["transition", "transition-property", "transition-duration", "transition-timing-function", "transition-delay", "animation", "animation-name", "animation-duration", "animation-delay", "animation-timing-function", "animation-iteration-count", "animation-fill-mode", "animation-play-state", "animation-direction", "animation-composition", "animation-range-start", "animation-range-end", "animation-timeline", "outline-width", "column-rule-width", "row-rule-width", "-webkit-locale", "perspective-origin", "transform-origin"]);
  // the preview pane re-zooms between loads: round px values so sub-pixel noise doesn't count as a diff
  const norm = (v) => v.replace(/-?\d+\.\d+(?=px)/g, (n) => Math.round(+n / 2) * 2).replace(/-?\d+\.\d+(?=[,\s)])/g, (n) => (+n).toFixed(2));
  // box tolerance: 2px, same reason
  window.qaBoxClose = (a, b) => { const A = a.split(",").map(Number), B = b.split(",").map(Number); return A.every((v, i) => Math.abs(v - B[i]) <= 2); };
  const settle = () => {
    document.querySelectorAll(".reveal").forEach((e) => e.classList.add("in"));
    document.getAnimations().forEach((a) => { try { a.finish(); } catch (e) {} });
  };
  const styleOf = (el, pseudo) => { const cs = getComputedStyle(el, pseudo); let s = ""; for (let i = 0; i < cs.length; i++) { const p = cs[i]; if (SKIP.has(p)) continue; s += p + ":" + norm(cs.getPropertyValue(p)) + ";"; } return s; };
  const ident = (el) => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "");
  window.qaSnapshot = async (label) => {
    settle(); await new Promise((r) => setTimeout(r, 400)); settle();
    const els = [...document.querySelectorAll("body *")];
    const rows = els.map((el) => { const r = el.getBoundingClientRect(); return { id: ident(el), h: hash(styleOf(el, null) + "|" + styleOf(el, "::before") + "|" + styleOf(el, "::after")), box: [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)].join(",") }; });
    localStorage.setItem("qa_" + label, JSON.stringify(rows));
    return { label, elements: rows.length, vw: innerWidth };
  };
  window.qaCompare = (a, b) => {
    const A = JSON.parse(localStorage.getItem("qa_" + a) || "[]"), B = JSON.parse(localStorage.getItem("qa_" + b) || "[]");
    if (A.length !== B.length) return { error: "element count differs", a: A.length, b: B.length };
    const diffs = [];
    A.forEach((x, i) => { if (x.h !== B[i].h || !window.qaBoxClose(x.box, B[i].box)) diffs.push({ i, id: x.id, box: x.box, boxB: B[i].box, style: x.h !== B[i].h }); });
    return { total: A.length, diffs: diffs.length, sample: diffs.slice(0, 40) };
  };
  window.qaStyleDiff = (i, pseudo) => { const el = document.querySelectorAll("body *")[i]; const cs = getComputedStyle(el, pseudo || null); const o = {}; for (let k = 0; k < cs.length; k++) { const p = cs[k]; if (!SKIP.has(p)) o[p] = norm(cs.getPropertyValue(p)); } return o; };
})();
