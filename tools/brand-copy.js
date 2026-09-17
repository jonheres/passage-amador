// Brand-aligned copy pass (2024 brand essentials + 2021 guidelines). Typography and colors untouched.
const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "index.html");
let h = fs.readFileSync(file, "utf8");
const R = (a, b) => { if (!h.includes(a)) console.warn("NOT FOUND:", a.slice(0, 70)); h = h.replace(a, b); };

// meta
R(`<title>Passage Amador — Residencias frente al mar en Amador, Panamá</title>`, `<title>Passage Amador — Residencias en la Calzada de Amador, vecinas del Canal de Panamá</title>`);
R(`<meta name="description" content="PASSAGE AMADOR. Residencias frente al mar en Amador, Panamá. Un nuevo capítulo donde la ciudad, la naturaleza y un estilo de vida extraordinario se encuentran.">`,
  `<meta name="description" content="Passage Amador: residencias en la Calzada de Amador, vecinas del Canal de Panamá. Un nuevo capítulo entre el Pacífico, la naturaleza y la ciudad.">`);
R(`<meta property="og:description" content="Residencias frente al mar, en el punto donde la ciudad, la naturaleza y un estilo de vida extraordinario se encuentran.">`,
  `<meta property="og:description" content="Residencias en la Calzada de Amador: vecinas del Canal, entre el Pacífico, la naturaleza y la ciudad.">`);

// hero
R(`alt="Arquitectura frente al mar al atardecer"`, `alt="Passage Amador al atardecer, junto al Canal de Panamá"`);
R(`<p>Residencias frente al mar, en el punto donde la ciudad, la naturaleza y un estilo de vida extraordinario se encuentran.</p>`,
  `<p>Residencias en la Calzada de Amador: vecinas del Canal, entre el Pacífico, la naturaleza y la ciudad.</p>`);

// intro
R(`Donde el mar abre posibilidades, la ciudad conecta tu ritmo y la naturaleza da equilibrio. Amador es más que un destino: es una nueva forma de vivir.`,
  `Donde el Canal abre el horizonte, la ciudad marca el ritmo y la naturaleza devuelve la calma. Amador no es un destino: es una forma de habitar Panamá.`);
R(`<li>Frente de agua</li>`, `<li>Vecino del Canal</li>`);
R(`<h3 class="theme__name">Mar</h3>
      <p>La bahía del Pacífico como primer plano. Marina, brisa y un horizonte que cambia con cada hora del día.</p>`,
  `<h3 class="theme__name">Canal</h3>
      <p>El Pacífico y el Canal de Panamá como horizonte. Un siglo de historia a la vista, y la brisa que cruza cada balcón.</p>`);
R(`<p>A minutos del Casco Antiguo y del skyline. La energía de Panamá, sin renunciar a la calma.</p>`,
  `<p>El Casco Antiguo y el centro a minutos. La energía de Panamá, con el refugio de vivir a su orilla.</p>`);
R(`<p>Cerros, manglares y el verde del Causeway rodeando cada residencia. Equilibrio como forma de vida.</p>`,
  `<p>Más de 5.000 m² de paisajismo con especies nativas envuelven las torres. Aquí, la mejor amenidad es el jardín.</p>`);
R(`alt="Amanecer sobre la bahía desde la piscina del rooftop"`, `alt="Amanecer sobre el Pacífico desde la piscina del rooftop"`);
R(`<figcaption><span>Rooftop</span>Amanecer sobre la bahía de Panamá, desde casa</figcaption>`, `<figcaption><span>Rooftop</span>Amanecer sobre el Pacífico, desde casa</figcaption>`);

// location
R(`En el corazón de Amador, rodeado de mar, naturaleza y conexión inmediata con algunos de los puntos más emblemáticos de la ciudad.`,
  `En la Calzada de Amador, construida con las rocas del Corte Culebra, con el Canal de Panamá como vecino y el Casco Antiguo a minutos.`);

// residences
R(`<p>Residencias diseñadas para inspirar. Espacios amplios, vistas inigualables y un equilibrio perfecto entre la ciudad, el mar y la naturaleza.</p>`,
  `<p>Ventanales de piso a techo y terrazas que borran el límite entre dentro y fuera. Cada residencia mira al Pacífico y sigue el pulso del Canal.</p>`);
R(`<span>Vistas panorámicas</span>
          <span>Privacidad</span>
          <span>Exclusividad</span>
          <span>Un estilo de vida único</span>`,
  `<span>Vistas al Pacífico y al Canal</span>
          <span>Brisa cruzada en cada balcón</span>
          <span>Intimidad</span>
          <span>Oficio en cada detalle</span>`);
R(`alt="Sala principal abierta a la terraza y la bahía"`, `alt="Sala principal abierta a la terraza y al Pacífico"`);

// amenities: PAISAJE · ROOFTOP · WELLNESS · COMUNIDAD
R(`<p class="reveal">Más que amenidades, una extensión de tu estilo de vida. Experiencias que elevan tu día a día y te conectan con lo que realmente importa.</p>`,
  `<p class="reveal">Su mejor amenidad es su paisaje. Lo demás —el agua, el movimiento, el encuentro— nace de él.</p>`);
R(`<span class="amenity__name">Rooftop</span>
        <span class="amenity__desc">Vistas inolvidables</span>
        <span class="amenity__items"><em>Piscina infinita</em><em>Deck y lounge</em><em>Zona BBQ</em></span>`,
  `<span class="amenity__name">Paisaje</span>
        <span class="amenity__desc">Naturaleza</span>
        <span class="amenity__items"><em>Jardines y senderos</em><em>Huerto</em><em>Cine al aire libre</em></span>`);
R(`<span class="amenity__name">Marina</span>
        <span class="amenity__desc">Naturaleza</span>
        <span class="amenity__items"><em>Muelle y bahía</em><em>Bike station</em><em>Ciclovía</em></span>`,
  `<span class="amenity__name">Rooftop</span>
        <span class="amenity__desc">Vistas inolvidables</span>
        <span class="amenity__items"><em>Piscina infinita</em><em>Deck solar</em><em>Observatorio</em></span>`);
R(`<span class="amenity__items"><em>Spa</em><em>Gimnasio</em><em>Salas de bienestar</em></span>`,
  `<span class="amenity__items"><em>Spa frío y calor</em><em>Cabina sensorial</em><em>Yoga deck</em><em>Fitness</em></span>`);
R(`<span class="amenity__name">Social</span>
        <span class="amenity__desc">Encuentros</span>
        <span class="amenity__items"><em>Club house</em><em>Pádel</em><em>Niños y mascotas</em></span>`,
  `<span class="amenity__name">Comunidad</span>
        <span class="amenity__desc">Encuentros</span>
        <span class="amenity__items"><em>Garden Club y BBQ</em><em>Pádel</em><em>Treehouse</em><em>Club Living</em></span>`);
// amenities media: keep images but re-map keys
h = h.replace(`data-amenity="rooftop" class="is-active"`, `data-amenity="paisaje" class="is-active"`);
h = h.replace(`data-amenity="marina"`, `data-amenity="rooftop"`);
h = h.replace(`<li class="amenity is-active" data-amenity="rooftop">`, `<li class="amenity is-active" data-amenity="paisaje">`);
h = h.replace(`<li class="amenity" data-amenity="marina">`, `<li class="amenity" data-amenity="rooftop">`);
h = h.replace(`data-amenity="social"`, `data-amenity="comunidad"`);
h = h.replace(`<li class="amenity" data-amenity="social">`, `<li class="amenity" data-amenity="comunidad">`);

// architecture
R(`Balcones profundos, ventanales de piso a techo y un ritmo vertical que ordena la fachada. La arquitectura responde primero al clima de Amador; el estilo viene después.`,
  `Balcones profundos, ventanales de piso a techo y un ritmo vertical que ordena la fachada. Inspirada en la arquitectura canalera, responde primero al clima de Amador; el estilo viene después. Cuatro torres, como las cuatro islas que las rocas del Corte Culebra unieron a la ciudad.`);
R(`<em><b class="edge">EDGE</b>Certificación en eficiencia de energía, agua y materiales</em>`, `<em><b class="edge">EDGE</b>Certificación EDGE · paneles solares · pisos Active Plus</em>`);

// gallery
R(`alt="Vista aérea del proyecto frente a la bahía"`, `alt="Vista aérea del proyecto junto al Canal"`);
R(`<figcaption><span>03</span><b>Frente al mar</b><em>El conjunto visto desde el agua, entre jardines y bahía.</em></figcaption>`,
  `<figcaption><span>03</span><b>Junto al Canal</b><em>El conjunto visto desde el agua, entre jardines y Pacífico.</em></figcaption>`);
R(`Interiores luminosos, vistas abiertas, materiales nobles y una arquitectura diseñada para acompañar cada momento de la vida frente al mar.`,
  `Interiores luminosos, vistas abiertas, materiales nobles y una arquitectura hecha con oficio para acompañar cada momento de la vida junto al Canal.`);

// FAQ
R(`<p>En la Calzada de Amador, Ciudad de Panamá, frente a la bahía y a minutos del Casco Antiguo, con el Puente de las Américas como horizonte.</p>`,
  `<p>En la Calzada de Amador, Ciudad de Panamá: vecina del Canal, con vista parcial al Pacífico y a minutos del Casco Antiguo.</p>`);
R(`<p>Rooftop con piscina infinita, deck y lounge, spa, gimnasio, club house, cancha de pádel, zona BBQ, ciclovía y bike station, áreas para niños y mascotas, y comercios en planta baja.</p>`,
  `<p>Más de 5.000 m² de paisajismo con especies nativas; rooftop con piscina infinita, deck solar y observatorio; spa frío y calor, cabina sensorial, yoga deck y fitness; Garden Club con BBQ, pádel, treehouse y piscina infantil; bike station conectada a la ciclovía del Causeway; concierge, lockers y área comercial con coffee shop, mini-market y farmacia.</p>`);

// behind
R(`Un proyecto se sostiene en quienes lo firman. La trayectoria, el estado de la obra y los equipos responsables, a la vista.`,
  `Una inversión en el patrimonio de Panamá se sostiene en quienes la firman. La trayectoria, el estado de la obra y los equipos responsables, a la vista.`);

// contact + footer
R(`<p class="contact__lead reveal">Déjanos tus datos y descubre más sobre PASSAGE AMADOR, sus residencias, amenidades y disponibilidad.</p>`,
  `<p class="contact__lead reveal">Déjanos tus datos y descubre más sobre Passage Amador: residencias, paisaje, amenidades y disponibilidad.</p>`);
R(`<p class="footer__tag">Un lugar donde todo se encuentra.</p>`, `<p class="footer__tag">Un vecino privilegiado del Canal de Panamá.</p>`);

fs.writeFileSync(file, h);
console.log("done");
