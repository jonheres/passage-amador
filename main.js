/* PASSAGE AMADOR — interactions */
(function () {
  "use strict";

  // Nav: solid once the hero is scrolled past
  const nav = document.getElementById("nav");
  const hero = document.getElementById("inicio");
  const onScroll = () => {
    const threshold = hero ? hero.offsetHeight - 90 : 400;
    nav.classList.toggle("is-solid", window.scrollY > threshold);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Reveal on scroll
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  // Location: list <-> map highlight
  const destItems = document.querySelectorAll(".destinations li");
  const mapPoints = document.querySelectorAll(".map-point");
  const setHot = (key) => {
    destItems.forEach((li) => li.classList.toggle("is-hot", li.dataset.point === key));
    mapPoints.forEach((g) => g.classList.toggle("is-hot", g.dataset.point === key));
  };
  destItems.forEach((li) => {
    li.addEventListener("mouseenter", () => setHot(li.dataset.point));
    li.addEventListener("mouseleave", () => setHot(null));
  });
  mapPoints.forEach((g) => {
    g.addEventListener("mouseenter", () => setHot(g.dataset.point));
    g.addEventListener("mouseleave", () => setHot(null));
  });

  // Amenities: hover/click swaps the backdrop
  const amenities = document.querySelectorAll(".amenity");
  const amenityImgs = document.querySelectorAll(".amenities__media img");
  const setAmenity = (key) => {
    amenities.forEach((li) => li.classList.toggle("is-active", li.dataset.amenity === key));
    amenityImgs.forEach((img) => img.classList.toggle("is-active", img.dataset.amenity === key));
  };
  amenities.forEach((li) => {
    li.addEventListener("mouseenter", () => setAmenity(li.dataset.amenity));
    li.addEventListener("click", () => setAmenity(li.dataset.amenity));
  });

  // Contact form: light validation + confirmation state
  const form = document.getElementById("leadForm");
  const success = document.getElementById("formSuccess");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll("[required]").forEach((field) => {
        const wrap = field.closest(".form__field");
        const ok = field.checkValidity() && field.value.trim() !== "";
        wrap.classList.toggle("has-error", !ok);
        if (!ok) valid = false;
      });
      if (!valid) return;

      // Sin backend en esta versión: se muestra el estado de confirmación.
      // Para producción, enviar los datos a un endpoint / CRM aquí.
      success.hidden = false;
      form.reset();
    });
  }
})();

/* Gallery thread: a line stitched through the caption numbers, drawn on scroll */
(function () {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;
  const svg = grid.querySelector(".gallery__thread");
  const path = svg.querySelector(".gallery__thread-path");
  const maskPath = svg.querySelector(".gallery__thread-mask");
  const nodesG = svg.querySelector(".gallery__thread-nodes");
  const figs = [...grid.querySelectorAll(".g")];
  let length = 0, pts = [];

  const build = () => {
    if (window.innerWidth <= 720) return;
    const gb = grid.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${gb.width} ${gb.height}`);
    pts = figs.map((f) => {
      const n = f.querySelector("figcaption span").getBoundingClientRect();
      return { x: n.left - gb.left - 12, y: n.top - gb.top + n.height / 2 };
    });
    // smooth curve through anchors: vertical-ish S curves between nodes
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const dy = (b.y - a.y) * 0.55;
      d += ` C${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`;
    }
    path.setAttribute("d", d);
    maskPath.setAttribute("d", d);
    length = maskPath.getTotalLength();
    maskPath.style.strokeDasharray = `${length}`;
    maskPath.style.strokeDashoffset = `${length}`;
    nodesG.innerHTML = pts.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="3.5"/>`).join("");
    draw();
  };

  const draw = () => {
    if (!length) return;
    const gb = grid.getBoundingClientRect();
    const vh = window.innerHeight;
    // progress: 0 when grid top reaches 75% of viewport, 1 when grid bottom reaches 55%
    const start = vh * 0.75, end = vh * 0.55;
    const p = Math.min(1, Math.max(0, (start - gb.top) / (gb.height - (vh - end) + start - vh + (vh - end))));
    maskPath.style.strokeDashoffset = `${length * (1 - p)}`;
    const reached = Math.floor(p * pts.length + 0.001);
    nodesG.querySelectorAll("circle").forEach((c, i) => c.classList.toggle("is-on", i < reached || p >= 0.999));
  };

  window.addEventListener("load", build);
  window.addEventListener("resize", build);
  window.addEventListener("scroll", draw, { passive: true });
  build();
})();

/* Amenities: pinned chapter — scrolling steps through the items */
(function () {
  const section = document.getElementById("amenidades");
  const items = [...document.querySelectorAll(".amenity")];
  if (!section || !items.length) return;
  const mq = window.matchMedia("(min-width: 1101px)");
  let last = -1;
  const setActive = (i) => {
    if (i === last) return;
    last = i;
    const key = items[i].dataset.amenity;
    items.forEach((li) => li.classList.toggle("is-active", li.dataset.amenity === key));
    document.querySelectorAll(".amenities__media img").forEach((img) => img.classList.toggle("is-active", img.dataset.amenity === key));
  };
  const onScroll = () => {
    if (!mq.matches) return;
    const r = section.getBoundingClientRect();
    const travel = r.height - window.innerHeight;
    if (travel <= 0) return;
    const p = Math.min(1, Math.max(0, -r.top / travel));
    // hold the first item a little, then step evenly
    const idx = Math.min(items.length - 1, Math.floor(p * items.length * 0.999));
    setActive(idx);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();
