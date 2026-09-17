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
