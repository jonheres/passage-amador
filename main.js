/* ==========================================================================
   PASSAGE AMADOR — interacciones
   Vanilla JS, sin dependencias. Cada bloque es un módulo independiente (IIFE)
   que se activa sólo si su marcado existe, en este orden:

   1. Títulos escalonados   h2.reveal → cada renglón renderizado sube por separado
   2. Nav + reveal + mapa   nav sólida al hacer scroll, .reveal → .in, hover mapa
   3. Amenidades (móvil)    tocar un ítem cambia el fondo y despliega su detalle
   4. Formulario            validación nativa + estado de confirmación (sin backend)
   5. Hilo de galería       línea punteada que se dibuja con el scroll (desktop)
   6. Amenidades (desktop)  capítulo fijado: el scroll avanza los ítems
   7. Tipologías            hover (desktop) / acordeón (móvil) → render isométrico
   8. FAQ                   acordeón <details> animado, uno abierto a la vez
   9. Menú móvil            burger, cierre con Esc o al elegir un enlace

   Breakpoints usados aquí (deben coincidir con styles.css):
   móvil ≤ 720px · tablet ≤ 1100px · desktop ≥ 1101px
   ========================================================================== */

/* 1. Títulos escalonados
   Parte cada h2.reveal en los renglones que realmente se renderizan (respeta los <br>
   del HTML y también el ajuste de línea) y envuelve cada uno en .line > span, para que
   suban uno a uno desde su máscara (misma animación lineUp del hero). Se recalcula al
   cargar las fuentes y al cambiar el ancho. */
(function () {
  "use strict";
  const heads = [...document.querySelectorAll("h2.reveal")].map((h) => {
    const src = h.innerHTML.split(/<br\s*\/?>/i).map((l) => l.trim()).filter(Boolean);
    return { h, src };
  });
  const build = () => {
    heads.forEach(({ h, src }) => {
      // 1) medir: cada palabra en su propio <i>, conservando los <br> del autor
      h.innerHTML = src.map((l) => l.split(/\s+/).map((w) => '<i class="w">' + w + "</i>").join(" ")).join("<br>");
      const rows = [];
      let lastTop = null, brIdx = 0;
      src.forEach((l) => {
        const words = l.split(/\s+/);
        const nodes = [...h.querySelectorAll(".w")].slice(brIdx, brIdx + words.length);
        brIdx += words.length;
        lastTop = null;
        nodes.forEach((n, i) => {
          const top = n.offsetTop;
          if (lastTop === null || Math.abs(top - lastTop) > 2) { rows.push([]); lastTop = top; }
          rows[rows.length - 1].push(words[i]);
        });
      });
      // 2) reconstruir como renglones enmascarados
      h.innerHTML = rows.map((r) => '<span class="line"><span>' + r.join(" ") + "</span></span>").join("");
      h.classList.add("reveal-lines");
      if (h.classList.contains("in")) h.classList.add("is-done"); // ya visible: no volver a animar
    });
  };
  build();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  let t;
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(build, 150); });
})();

/* 2. Nav, reveal on scroll, mapa, amenidades (móvil) y formulario */
(function () {
  "use strict";

  // Nav: sólida (fondo papel, logo negro) una vez que el hero queda atrás
  const nav = document.getElementById("nav");
  const hero = document.getElementById("inicio");
  const onScroll = () => {
    const threshold = hero ? hero.offsetHeight - 90 : 400;
    nav.classList.toggle("is-solid", window.scrollY > threshold);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Reveal: .reveal recibe .in cuando entra en el viewport (una sola vez)
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

  // Ubicación: hover en la lista de destinos ⇄ punto del mapa (data-point)
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

  // 3. Amenidades: hover/click en un ítem cambia el fondo (data-amenity).
  //    En móvil el click también despliega la línea de detalle (CSS: .amenity.is-active .amenity__items)
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

  // 4. Formulario: valida los campos obligatorios y muestra #formSuccess.
  //    Sin backend en esta versión: en producción, enviar los datos al CRM aquí.
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
      success.hidden = false;
      form.reset();
    });
  }
})();

/* 5. Hilo de galería
   Traza una curva suave por los números de las leyendas (.g figcaption span) y la
   revela con el scroll mediante stroke-dashoffset sobre la máscara. Desactivado ≤ 720px. */
(function () {
  "use strict";
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
    // curvas en S entre nodos consecutivos
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
    // progreso 0 → 1 mientras el grid cruza el viewport (del 75% al 55% de la altura)
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

/* 6. Amenidades — capítulo fijado (sólo desktop ≥ 1101px)
   La sección mide 2.6 pantallas (CSS) y su contenido queda sticky; el avance del
   scroll dentro de la sección selecciona el ítem activo y su fondo. */
(function () {
  "use strict";
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
    const idx = Math.min(items.length - 1, Math.floor(p * items.length * 0.999));
    setActive(idx);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();

/* 7. Tipologías
   Desktop: hover/focus en una fila (a.type-row[data-unit]) muestra su isométrico en la
   figura lateral y actualiza la etiqueta "Modelo". Móvil (≤ 720px): la fila funciona
   como acordeón (click), el CTA de la fila sigue llevando a #contacto. */
(function () {
  "use strict";
  const rows = [...document.querySelectorAll(".type-row[data-unit]")];
  const imgs = [...document.querySelectorAll(".types__figure img")];
  const label = document.querySelector(".types__figure-label b");
  if (!rows.length || !imgs.length) return;
  const set = (key) => {
    rows.forEach((r) => r.classList.toggle("is-active", r.dataset.unit === key));
    imgs.forEach((i) => i.classList.toggle("is-active", i.dataset.unit === key));
    const r = rows.find((x) => x.dataset.unit === key);
    if (label && r) label.textContent = r.querySelector(".type-row__type").firstChild.textContent.trim();
  };
  const mobile = window.matchMedia("(max-width: 720px)");
  rows.forEach((r) => {
    r.addEventListener("mouseenter", () => { if (!mobile.matches) set(r.dataset.unit); });
    r.addEventListener("focus", () => { if (!mobile.matches) set(r.dataset.unit); });
    r.addEventListener("click", (e) => {
      if (!mobile.matches) return;
      if (e.target.closest(".type-row__cta")) return;
      e.preventDefault();
      set(r.dataset.unit);
    });
  });
})();

/* 8. FAQ — acordeón animado
   Los <details> se mantienen abiertos (el contenido queda en el DOM y es indexable);
   la apertura visual se anima con la clase .is-open (CSS). Uno abierto a la vez. */
(function () {
  "use strict";
  const items = [...document.querySelectorAll(".faq__item")];
  items.forEach((d) => {
    d.open = true;
    d.querySelector("summary").addEventListener("click", (e) => {
      e.preventDefault();
      const wasOpen = d.classList.contains("is-open");
      items.forEach((o) => o.classList.remove("is-open"));
      if (!wasOpen) d.classList.add("is-open");
    });
  });
})();

/* 9. Menú móvil (burger) */
(function () {
  "use strict";
  const nav = document.getElementById("nav");
  const burger = document.getElementById("navBurger");
  const menu = document.getElementById("mobileMenu");
  if (!burger || !menu) return;
  const set = (open) => {
    nav.classList.toggle("is-open", open);
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  };
  burger.addEventListener("click", () => set(!menu.classList.contains("is-open")));
  menu.querySelectorAll("a[href^='#']").forEach((a) => a.addEventListener("click", () => set(false)));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
})();
