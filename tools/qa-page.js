// Browser-side QA helper (load in the page, then call window.qaPage()).
// Checks layout/interaction health at the current viewport and returns a report object:
// horizontal overflow, elements wider than the viewport, clipped title lines, broken images,
// small tap targets (≤720px), dangling anchors, heading order, duplicate ids, console errors.
(function () {
  const errors = [];
  window.addEventListener("error", (e) => errors.push(String(e.message)));
  window.__qaErrors = errors;
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"; };
  window.qaPage = async () => {
    document.querySelectorAll(".reveal").forEach((e) => e.classList.add("in"));
    document.getAnimations().forEach((a) => { try { a.finish(); } catch (e) {} });
    await new Promise((r) => setTimeout(r, 300));
    const vw = document.documentElement.clientWidth;
    const rep = { vw, vh: innerHeight, docWidth: document.documentElement.scrollWidth, hOverflow: document.documentElement.scrollWidth > vw + 1 };
    // elements that stick out of the viewport horizontally (ignoring things intentionally clipped by an overflow:hidden/clip ancestor)
    const clippedBy = (el) => { let p = el.parentElement; while (p) { const o = getComputedStyle(p); if (/hidden|clip|auto|scroll/.test(o.overflowX) || /hidden|clip|auto|scroll/.test(o.overflow)) return true; p = p.parentElement; } return false; };
    rep.wide = [...document.querySelectorAll("body *")].filter((el) => vis(el) && !clippedBy(el)).map((el) => ({ el, r: el.getBoundingClientRect() })).filter(({ r }) => r.right > vw + 2 || r.left < -2).map(({ el, r }) => `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]} [${Math.round(r.left)}→${Math.round(r.right)}]`).slice(0, 15);
    // title lines: the inner span must fit its .line mask width
    rep.clippedLines = [...document.querySelectorAll(".line > span, .hero__title .line span")].filter((s) => s.scrollWidth > s.parentElement.clientWidth + 1).map((s) => s.textContent.trim().slice(0, 30));
    rep.brokenImgs = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && !i.closest("[hidden]")).map((i) => i.getAttribute("src"));
    rep.smallTargets = vw <= 720 ? [...document.querySelectorAll("a, button, summary, select, input, .amenity, .type-row")].filter(vis).map((el) => ({ el, r: el.getBoundingClientRect() })).filter(({ r }) => r.height < 32 || r.width < 32).map(({ el, r }) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 24)}" ${Math.round(r.width)}×${Math.round(r.height)}`).slice(0, 20) : "n/a";
    rep.danglingAnchors = [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute("href")).filter((h) => h.length > 1 && !document.querySelector(h)).filter((v, i, a) => a.indexOf(v) === i);
    const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => +h.tagName[1]); rep.headingJumps = hs.filter((l, i) => i && l > hs[i - 1] + 1).length;
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id); rep.dupIds = ids.filter((x, i) => ids.indexOf(x) !== i);
    rep.errors = errors.slice();
    rep.fontsLoaded = document.fonts.check('300 16px "Inter Tight"');
    rep.textOverflow = [...document.querySelectorAll("p, li, dd, dt, span, h1, h2, h3, a, figcaption, summary")].filter((el) => vis(el) && getComputedStyle(el).whiteSpace === "nowrap" && el.scrollWidth > el.clientWidth + 1 && !clippedBy(el)).map((el) => el.textContent.trim().slice(0, 30)).slice(0, 10);
    return rep;
  };
})();
