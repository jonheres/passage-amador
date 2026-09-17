// One-off: reorder sections to the approved structure and add the new blocks.
const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "index.html");
let h = fs.readFileSync(file, "utf8");

// ---------- helpers ----------
const cut = (startMarker, endMarker) => {
  const s = h.indexOf(startMarker);
  const e = endMarker ? h.indexOf(endMarker, s) : h.length;
  if (s < 0 || e < 0) throw new Error("marker not found: " + startMarker);
  const chunk = h.slice(s, e);
  h = h.slice(0, s) + h.slice(e);
  return chunk;
};
const M = (n) => `<!-- ============ ${n} ============ -->`;

// ---------- 1. NAV ----------
h = h.replace(
  /<nav class="nav__links">[\s\S]*?<\/nav>\n  <a href="#contacto" class="nav__cta">Solicitar información<\/a>/,
  `<nav class="nav__links">
    <a href="#residencias">Residencias</a>
    <a href="#ubicacion">Ubicación</a>
    <a href="#amenidades">Estilo de vida</a>
    <a href="#proyecto">Proyecto</a>
  </nav>
  <div class="nav__right">
    <a href="#" class="nav__lang" aria-label="Cambiar idioma"><span class="is-on">ES</span><i>/</i><span>EN</span></a>
    <a href="#contacto" class="nav__cta">Solicitar información</a>
  </div>`
);

// ---------- 2. INTRO: 4 key facts after the triptych ----------
h = h.replace(
  `  </ul>
  <div class="scroll-line scroll-line--dark" aria-hidden="true"><span></span></div>
</section>

${M("03 UBICACIÓN")}`,
  `  </ul>

  <dl class="facts reveal">
    <div><dt>Frente de agua</dt><dd>La bahía de Panamá y el Puente de las Américas como paisaje permanente.</dd></div>
    <div><dt>Tres tipologías</dt><dd>Residencias de una, dos y tres recámaras, de 54 a 122 m².</dd></div>
    <div><dt>Amador, Panamá</dt><dd>Calzada de Amador, a minutos del Casco Antiguo y del centro financiero.</dd></div>
    <div><dt>Conectada a la ciudad</dt><dd>Acceso directo al centro urbano y al aeropuerto, sin renunciar a la calma.</dd></div>
  </dl>
  <div class="scroll-line scroll-line--dark" aria-hidden="true"><span></span></div>
</section>

${M("03 UBICACIÓN")}`
);

// ---------- 3. STATEMENT after location ----------
const statement = `${M("03b DECLARACIÓN")}
<section class="statement" aria-label="Declaración">
  <p class="statement__text reveal">La ciudad queda a la vista.<br><span>El ruido, no.</span></p>
</section>

`;
h = h.replace(M("04 RESIDENCIAS"), statement + M("04 RESIDENCIAS"));

// ---------- 4. TIPOLOGÍAS: CTA per model + move before amenidades ----------
h = h.replace(/<a href="#contacto" class="type-row( is-active)?" data-unit="(\w+)">/g, (m, act, unit) =>
  `<a href="#contacto" class="type-row${act || ""}" data-unit="${unit}" data-interes="${unit}">`);
h = h.replace(/<span class="type-row__arrow" aria-hidden="true">→<\/span>/g, `<span class="type-row__cta">Solicitar detalles<i aria-hidden="true">→</i></span>`);
h = h.replace(/<p class="types__note">[^<]*<\/p>/, `<p class="types__note">Superficies según brochure. Cada solicitud recibe plantas, orientaciones y disponibilidad actualizada del modelo elegido.</p>`);

const types = cut(M("07 TIPOLOGÍAS"), M("08 CONTACTO"));
h = h.replace(M("05 AMENIDADES"), types.replace(M("07 TIPOLOGÍAS"), M("05 TIPOLOGÍAS")) + M("05 AMENIDADES"));

// ---------- 5. AMENIDADES: concrete list after the pinned chapter ----------
const amenList = `${M("06b AMENIDADES · LISTA")}
<section class="amen-list" aria-label="Amenidades del proyecto">
  <div class="amen-list__head">
    <p class="amen-list__lead reveal">Un día en Passage se reparte entre el agua, el movimiento y el descanso. Las amenidades acompañan ese ritmo sin protagonizarlo.</p>
  </div>
  <div class="amen-list__cols reveal">
    <dl class="amen-group">
      <dt>Mañana en el agua</dt>
      <dd>Piscina infinita en el rooftop</dd>
      <dd>Deck y lounge frente a la bahía</dd>
      <dd>Spa y salas de bienestar</dd>
      <dd>Gimnasio</dd>
    </dl>
    <dl class="amen-group">
      <dt>Silencio adentro</dt>
      <dd>Club house</dd>
      <dd>Salón social y coworking</dd>
      <dd>Balcones profundos con doble y triple acceso</dd>
      <dd>Lobby con atención permanente</dd>
    </dl>
    <dl class="amen-group">
      <dt>Tarde afuera</dt>
      <dd>Cancha de pádel</dd>
      <dd>Zona BBQ</dd>
      <dd>Ciclovía y bike station</dd>
      <dd>Juegos de niños y plaza para mascotas</dd>
      <dd>Comercios y restaurantes en planta baja</dd>
    </dl>
  </div>
  <p class="amen-list__note">[Lista final de amenidades sujeta a confirmación del desarrollador.]</p>
</section>

`;

// ---------- 6. ARQUITECTURA Y DISEÑO (new) ----------
const arch = `${M("07 ARQUITECTURA")}
<section class="arch" id="arquitectura">
  <div class="arch__inner">
    <div class="arch__text">
      <div class="section-index section-index--light">
        <span class="idx">06</span>
        <span class="idx-label">Arquitectura y diseño</span>
      </div>
      <h2 class="arch__title reveal">Una fachada pensada<br>para la sombra<br>y la brisa</h2>
      <p class="arch__lead reveal">Balcones profundos, ventanales de piso a techo y un ritmo vertical que ordena la fachada. La arquitectura responde primero al clima de Amador; el estilo viene después.</p>
      <dl class="ledger ledger--light reveal">
        <div class="ledger__row"><dt>Arquitectura</dt><dd>[Estudio de arquitectura]</dd></div>
        <div class="ledger__row"><dt>Interiorismo</dt><dd>[Estudio de interiorismo]</dd></div>
        <div class="ledger__row"><dt>Materiales</dt><dd>Travertino, madera cálida, estuco claro y vidrio de baja emisividad.</dd></div>
        <div class="ledger__row"><dt>Sostenibilidad</dt><dd><span class="edge">Certificación EDGE</span>Eficiencia en energía, agua y materiales.</dd></div>
      </dl>
      <a href="#proyecto" class="link-arrow reveal">Conocer el proyecto<i aria-hidden="true">→</i></a>
    </div>
    <figure class="arch__figure reveal">
      <img src="img/arch-facade.jpg" alt="Fachada de Passage Amador con balcones profundos" loading="lazy">
    </figure>
  </div>
</section>

`;

// ---------- 7. QUIÉN ESTÁ DETRÁS + FAQ (new) ----------
const behind = `${M("09 PROYECTO")}
<section class="behind" id="proyecto">
  <div class="behind__head">
    <div class="section-index">
      <span class="idx">08</span>
      <span class="idx-label">El proyecto</span>
    </div>
    <h2 class="behind__title reveal">Quién está detrás<br>de Passage</h2>
    <p class="behind__lead reveal">Un proyecto se sostiene en quienes lo firman. Aquí, la trayectoria, el estado de la obra y los equipos responsables están a la vista.</p>
  </div>
  <dl class="facts facts--behind reveal">
    <div><dt>Desarrollador</dt><dd><b>[Nombre del desarrollador]</b>[Trayectoria y proyectos entregados.]</dd></div>
    <div><dt>Etapa actual</dt><dd><b>[Etapa de obra]</b>Avance verificable en sala de ventas.</dd></div>
    <div><dt>Entrega estimada</dt><dd><b>[Fecha estimada]</b>Sujeta a confirmación del desarrollador.</dd></div>
    <div><dt>Arquitectura y obra</dt><dd><b>[Estudio y constructora]</b>Credenciales y aliados del proyecto.</dd></div>
  </dl>
</section>

${M("10 PREGUNTAS")}
<section class="faq" id="preguntas">
  <svg class="orn orn-faq" viewBox="0 0 375 365" aria-hidden="true" preserveAspectRatio="xMinYMin meet"><use href="#orn1-path"/></svg>
  <div class="faq__inner">
    <div class="faq__head">
      <div class="section-index">
        <span class="idx">09</span>
        <span class="idx-label">Preguntas frecuentes</span>
      </div>
      <h2 class="faq__title reveal">Antes de<br>escribirnos</h2>
    </div>
    <div class="faq__list reveal">
      <details class="faq__item" open>
        <summary>¿Dónde queda exactamente Passage?<span aria-hidden="true"></span></summary>
        <p>En la Calzada de Amador, Ciudad de Panamá, frente a la bahía y a minutos del Casco Antiguo, con el Puente de las Américas como horizonte.</p>
      </details>
      <details class="faq__item">
        <summary>¿Qué tipos de residencias hay?<span aria-hidden="true"></span></summary>
        <p>Tres modelos: Casia (una recámara, 54 m²), Almendro (dos recámaras, 84 m²) y Panamá (tres recámaras, 122 m²). Todos con cocina abierta y balcón de doble o triple acceso.</p>
      </details>
      <details class="faq__item">
        <summary>¿Hay unidades disponibles?<span aria-hidden="true"></span></summary>
        <p>[Disponibilidad actual por modelo.] Solicita información y recibirás el inventario actualizado con orientaciones y niveles.</p>
      </details>
      <details class="faq__item">
        <summary>¿En qué etapa está el proyecto?<span aria-hidden="true"></span></summary>
        <p>[Etapa de obra y fecha estimada de entrega.] El avance puede verificarse en la sala de ventas.</p>
      </details>
      <details class="faq__item">
        <summary>¿Qué amenidades incluye?<span aria-hidden="true"></span></summary>
        <p>Rooftop con piscina infinita, deck y lounge, spa, gimnasio, club house, cancha de pádel, zona BBQ, ciclovía y bike station, áreas para niños y mascotas, y comercios en planta baja.</p>
      </details>
      <details class="faq__item">
        <summary>¿Cómo hablo con el equipo de ventas?<span aria-hidden="true"></span></summary>
        <p>A través del formulario de esta página, por WhatsApp o en la sala de ventas en la Calzada de Amador. [Horario de atención.]</p>
      </details>
    </div>
  </div>
</section>

`;

// insert amenList + arch after amenidades (before galería); behind + faq after galería (before contacto)
h = h.replace(M("06 GALERÍA"), amenList + arch + M("08 GALERÍA"));
h = h.replace(M("08 CONTACTO"), behind + M("11 CONTACTO"));

// ---------- 8. re-number section indices in document order ----------
const order = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
let k = 0;
h = h.replace(/<span class="idx">\d\d<\/span>\n(\s+)<span class="idx-label">/g, (m, sp) => `<span class="idx">${order[k++]}</span>\n${sp}<span class="idx-label">`);

// ---------- 9. CONTACT tweaks ----------
h = h.replace(`<label for="f-tel">Teléfono</label>`, `<label for="f-tel">Teléfono / WhatsApp</label>`);
h = h.replace(
  /<option value="" disabled selected>Selecciona una opción<\/option>[\s\S]*?<\/select>/,
  `<option value="" disabled selected>Selecciona una opción</option>
          <option value="casia">Casia — 1 recámara</option>
          <option value="almendro">Almendro — 2 recámaras</option>
          <option value="panama">Panamá — 3 recámaras</option>
          <option value="inversion">Inversión</option>
          <option value="segunda">Segunda residencia</option>
        </select>`
);
h = h.replace(`Al enviar aceptas ser contactado por el equipo comercial de PASSAGE AMADOR.`, `Al enviar aceptas que el equipo de Passage te contacte con información del proyecto. <a href="#privacidad">Política de privacidad</a>.`);

// ---------- 10. FOOTER ----------
h = h.replace(
  /<nav class="footer__nav">[\s\S]*?<\/nav>/,
  `<nav class="footer__nav footer__nav--cols">
      <div><span class="footer__col-title">Proyecto</span><a href="#residencias">Residencias</a><a href="#ubicacion">Ubicación</a><a href="#amenidades">Estilo de vida</a><a href="#proyecto">El proyecto</a></div>
      <div><span class="footer__col-title">Contacto</span><a href="#contacto">Solicitar información</a><a href="https://wa.me/50760000000" target="_blank" rel="noopener">WhatsApp</a><a href="mailto:ventas@passagepanama.com">Correo de ventas</a></div>
      <div><span class="footer__col-title">Legal</span><a href="#privacidad">Política de privacidad</a><a href="#cookies">Preferencias de cookies</a><a href="#terminos">Términos</a></div>
    </nav>`
);
h = h.replace(`<span>© 2026 PASSAGE AMADOR. Todos los derechos reservados.</span>`, `<span>© 2026 Passage. Imágenes referenciales; los renders pueden variar respecto al proyecto final.</span><a href="#" class="footer__lang"><span class="is-on">ES</span> / <span>EN</span></a>`);
h = h.replace(`<span>Imágenes referenciales. Renders y especificaciones sujetos a cambios.</span>`, `<span>Amador, Panamá</span>`);

// ---------- 11. ornament symbol for reuse (from orn-1 inline path) ----------
const orn1 = h.match(/<svg class="orn orn-1"[^>]*><path d="([^"]+)"\/><\/svg>/);
if (orn1) h = h.replace(`<main>`, `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><path id="orn1-path" d="${orn1[1]}"/></defs></svg>\n<main>`);

fs.writeFileSync(file, h);
console.log("sections:", [...h.matchAll(/<!-- ============ ([^=]+) ============ -->/g)].map((m) => m[1].trim()).join(" | "));
