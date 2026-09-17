// Pass: less density, more scale. Same approved structure.
const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "index.html");
let h = fs.readFileSync(file, "utf8");
const between = (a, b) => { const s = h.indexOf(a); const e = h.indexOf(b, s); if (s < 0 || e < 0) throw new Error("not found: " + a); return [s, e]; };

// 1. facts row -> one microcopy strip under the panorama
{
  const [s, e] = between('  <dl class="facts reveal">', "  </dl>\n");
  h = h.slice(0, s) + h.slice(e + "  </dl>\n".length);
  h = h.replace(
    /(<figcaption><span>Rooftop<\/span>[^<]*<\/figcaption>\n  <\/figure>\n)/,
    `$1
  <ul class="keyline reveal" aria-label="Datos clave">
    <li>Frente de agua</li>
    <li>Tres tipologías · 54 a 122 m²</li>
    <li>Calzada de Amador</li>
    <li>15 min del centro</li>
  </ul>
`
  );
}

// 2. statement -> closing line inside the location section
{
  const [s, e] = between('<!-- ============ 03b DECLARACIÓN ============ -->', "<!-- ============ 04 RESIDENCIAS");
  h = h.slice(0, s) + h.slice(e);
  h = h.replace(
    `  </div>\n  <div class="scroll-line scroll-line--light" aria-hidden="true"><span></span></div>\n</section>`,
    `  </div>
  <p class="location__close reveal">La ciudad queda a la vista.<br><span>El ruido, no.</span></p>
  <div class="scroll-line scroll-line--light" aria-hidden="true"><span></span></div>
</section>`
  );
}

// 3. amenities list -> items inside the pinned chapter
{
  const [s, e] = between('<!-- ============ 06b AMENIDADES · LISTA ============ -->', "<!-- ============ 07 ARQUITECTURA");
  h = h.slice(0, s) + h.slice(e);
  const items = {
    rooftop: ["Piscina infinita", "Deck y lounge", "Zona BBQ"],
    marina: ["Muelle y bahía", "Bike station", "Ciclovía"],
    wellness: ["Spa", "Gimnasio", "Salas de bienestar"],
    social: ["Club house", "Pádel", "Niños y mascotas"],
  };
  for (const [k, list] of Object.entries(items)) {
    h = h.replace(new RegExp(`(<li class="amenity[^"]*" data-amenity="${k}">[\\s\\S]*?<span class="amenity__desc">[^<]*</span>)`),
      `$1\n        <span class="amenity__items">${list.map((t) => `<em>${t}</em>`).join("")}</span>`);
  }
  h = h.replace(`<span class="amenity__desc">Vistas inolvidables</span>`, `<span class="amenity__desc">Vistas inolvidables</span>`);
}

// 4. architecture -> cinematic full-bleed
{
  const [s, e] = between('<section class="arch" id="arquitectura">', "</section>");
  const arch = `<section class="arch" id="arquitectura">
  <div class="arch__media" aria-hidden="true"><img src="img/arch-facade.jpg" alt="" loading="lazy"></div>
  <div class="arch__frame">
    <div class="section-index section-index--light">
      <span class="idx">06</span>
      <span class="idx-label">Arquitectura y diseño</span>
    </div>
    <h2 class="arch__title reveal">Una fachada<br>pensada para<br>la sombra y la brisa</h2>
    <div class="arch__foot">
      <p class="arch__lead reveal">Balcones profundos, ventanales de piso a techo y un ritmo vertical que ordena la fachada. La arquitectura responde primero al clima de Amador; el estilo viene después.</p>
      <ul class="arch__ficha reveal">
        <li><span>Arquitectura</span>[Estudio de arquitectura]</li>
        <li><span>Interiorismo</span>[Estudio de interiorismo]</li>
        <li><span>Materiales</span>Travertino, madera cálida, estuco claro</li>
        <li><span>Sostenibilidad</span><b class="edge">EDGE</b>Certificación en eficiencia</li>
      </ul>
    </div>
  </div>
`;
  h = h.slice(0, s) + arch + h.slice(e);
}

// 5. quién está detrás -> editorial ledger
{
  const [s, e] = between('<section class="behind" id="proyecto">', "</section>");
  const behind = `<section class="behind" id="proyecto">
  <div class="behind__inner">
    <div class="behind__head">
      <div class="section-index">
        <span class="idx">08</span>
        <span class="idx-label">El proyecto</span>
      </div>
      <h2 class="behind__title reveal">Quién está<br>detrás</h2>
      <p class="behind__lead reveal">Un proyecto se sostiene en quienes lo firman. La trayectoria, el estado de la obra y los equipos responsables, a la vista.</p>
    </div>
    <dl class="ledger ledger--behind reveal">
      <div class="ledger__row"><dt>Desarrollador</dt><dd><span class="big">[Nombre del desarrollador]</span><small>[Trayectoria y proyectos entregados]</small></dd></div>
      <div class="ledger__row"><dt>Etapa actual</dt><dd><span class="big">[Etapa de obra]</span><small>Avance verificable en sala de ventas</small></dd></div>
      <div class="ledger__row"><dt>Entrega estimada</dt><dd><span class="big">[Fecha estimada]</span><small>Sujeta a confirmación del desarrollador</small></dd></div>
      <div class="ledger__row"><dt>Arquitectura y obra</dt><dd><span class="big">[Estudio y constructora]</span><small>Credenciales y aliados del proyecto</small></dd></div>
    </dl>
  </div>
`;
  h = h.slice(0, s) + behind + h.slice(e);
}

// 6. FAQ + contact: no chapter number (coda)
h = h.replace(/<div class="section-index">\n\s+<span class="idx">09<\/span>\n\s+<span class="idx-label">Preguntas frecuentes<\/span>\n\s+<\/div>/, `<div class="section-index section-index--coda"><span class="idx-label">Preguntas frecuentes</span></div>`);
h = h.replace(/<div class="section-index section-index--light">\n\s+<span class="idx">10<\/span>\n\s+<span class="idx-label">Contacto<\/span>\n\s+<\/div>/, `<div class="section-index section-index--light section-index--coda"><span class="idx-label">Contacto</span></div>`);

fs.writeFileSync(file, h);
console.log("ok", [...h.matchAll(/<!-- ============ ([^=]+) ============ -->/g)].map((m) => m[1].trim()).join(" | "));
