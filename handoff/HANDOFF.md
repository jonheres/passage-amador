# PASSAGE AMADOR — Paquete de handoff para WordPress + Elementor Pro

**Para:** Sinéctica (implementación en WordPress / Elementor Pro)
**De:** Jonathan Heres — dirección de diseño y desarrollo del landing de referencia
**Fecha:** 18 de septiembre de 2026 · **Versión de referencia:** rama `main` de `github.com/jonheres/passage-amador`

**Referencias en vivo (fuente de verdad visual y funcional):**
- Español: https://jonheres.github.io/passage-amador/
- Inglés: https://jonheres.github.io/passage-amador/en/

---

## 0. Objetivo y alcance

Replicar el landing **fielmente** en WordPress con Elementor Pro: mismo aspecto, mismo comportamiento y mismos detalles en desktop, tablet y móvil, en español e inglés. El entregable no es "un diseño para inspirarse": es una implementación terminada, validada y publicada, cuyo código (HTML, CSS y JS) es el que se debe reutilizar.

El sitio es estático, sin build ni dependencias: `index.html` + `styles.css` + `main.js` + `img/`. Todo lo que hace lo hace con HTML semántico, CSS moderno y 13 KB de JavaScript vanilla. **Es replicable en Elementor Pro sin sacrificar fidelidad**, siempre que se siga la estrategia de este documento: Elementor como estructura y editor de contenido, y el CSS/JS entregados como capa de presentación y comportamiento. Lo que no conviene hacer es "rehacer el diseño con widgets" ajustando estilos control por control: se pierde el detalle y se multiplica el esfuerzo.

### Contenido del paquete (`handoff/`)

| Archivo | Qué es |
|---|---|
| `HANDOFF.md` | Este documento |
| `snippets/NN-seccion.es.html` / `.en.html` | HTML de cada sección, listo para pegar en un widget HTML de Elementor (13 secciones × 2 idiomas) |
| `snippets/mapa-amador.es.svg` / `.en.svg` | El mapa de Ubicación como SVG independiente, por idioma |
| `snippets/ornamento-defs.html` | Símbolo SVG del ornamento de marca (`#orn1-path`), se incluye una vez por página |
| `elementor-form.css` | CSS puente si el formulario se hace con el widget **Form** de Elementor Pro (recomendado para CRM) |
| `wordpress-loader.php` | Carga de `styles.css`, `main.js` y la fuente desde el child theme |
| `../styles.css` | Hoja de estilos consolidada (75 KB, comentada por componente) — **se usa tal cual** |
| `../main.js` | Interacciones (9 módulos documentados) — **se usa tal cual** |
| `../img/` | 33 activos finales con sus nombres definitivos |
| `../tools/i18n-en.json` + `../TRANSLATION-EN.md` | Diccionario ES → EN (270 cadenas) para el plugin multilingüe |
| `../SITE-AUDIT.md` / `../CONTENT-AUDIT.md` | Auditoría técnica y de contenido |

---

## 1. No negociables

Estos puntos definen la fidelidad. Cualquier desviación debe consultarse antes de implementarse.

1. **Tipografía:** Inter Tight, pesos 300 / 400 / 500, única familia. Títulos en 300 con tracking negativo y versalitas; etiquetas y CTA en 500 con tracking amplio. Escalas fluidas con `clamp()` (ya en `styles.css`).
2. **Colores:** únicamente los tokens de `:root` en `styles.css` (`--paper #F4F1EB`, `--ink #0E0E0D`, `--sand`, `--ocean #1F4A5C`, `--sunset #D9A16A`, `--green #2F4A10`…). No introducir colores de Elementor.
3. **Ritmo y espacio:** paddings de sección `clamp(100px, 10vw, 160px)`, gutter `clamp(24px, 4vw, 72px)`, reglas de 1 px, índices `01…08` con regla, una sola esquina redondeada de 20 px en renders, iconos de trazo 1 px. Sin sombras ni degradados decorativos.
4. **Breakpoints:** desktop ≥ 1101 px · tablet ≤ 1100 px · móvil ≤ 720 px. Elementor debe configurarse con estos mismos valores (§3.2).
5. **Movimiento:** títulos que suben renglón a renglón (escalonados), reveal al entrar en viewport, nav que se vuelve sólida, hero con zoom lento, hilo de galería que se dibuja, capítulo de amenidades fijado por scroll. Respetar `prefers-reduced-motion`.
6. **Comportamientos móviles:** acordeón de tipologías, toggle de amenidades, menú a pantalla completa con selector de idioma siempre visible junto al burger, mapa ampliado con etiquetas grandes.
7. **Contenido:** los textos son definitivos y están validados con el desarrollador (ES) y el equipo (EN). No parafrasear. Los placeholders pendientes están listados en §9.
8. **Semántica y SEO:** un `h1`, un `h2` por sección, `<details>` en FAQ, `<dl>` en fichas, metadatos y JSON-LD según `index.html`. `hreflang` ES/EN.

---

## 2. Estrategia de implementación (resumen ejecutivo)

```
Tema:           Hello Elementor + child theme  (cero CSS de tema)
Estructura:     Contenedores Flexbox de Elementor, uno por sección, con las mismas clases CSS
                y los mismos IDs de ancla (#inicio, #intro, #ubicacion, …)
Contenido:      · Widgets nativos (Heading, Text, Image, Nav Menu, Form) donde el marcado resultante
                  puede llevar nuestras clases
                · Widget HTML con el snippet entregado donde el marcado es específico
                  (mapa SVG, tipologías, amenidades, galería con hilo, FAQ, ledger)
Presentación:   styles.css completo, encolado después de Elementor (o en Custom Code)
Comportamiento: main.js encolado con defer. Sin dependencias. Funciona sobre las clases/IDs originales.
Idiomas:        una página por idioma (ES / EN) gestionada por el plugin multilingüe;
                los snippets .en.html ya traducidos; diccionario JSON para el plugin.
```

**Regla práctica:** el HTML final que genere WordPress debe contener las mismas clases e IDs que `index.html` en cada bloque. Si eso se cumple, `styles.css` y `main.js` hacen el resto sin adaptación. La forma más segura de cumplirlo en las secciones complejas es el widget HTML con el snippet; en las sencillas basta con asignar la clase en *Advanced → CSS Classes* del contenedor/widget.

---

## 3. Configuración global de WordPress / Elementor

### 3.1 Tema y ajustes
- **Hello Elementor** con child theme (para `functions.php` y para alojar `passage/styles.css`, `passage/main.js`, `passage/img/`).
- Elementor → Settings → General: **Disable Default Colors** y **Disable Default Fonts** activados.
- Elementor → Settings → Features: *Flexbox Container* activo, *Optimized DOM output* activo.
- Site Settings → Layout: ancho de contenido **100 %** (el sitio maneja sus propios gutters), *Default padding* de contenedores en 0.
- Site Settings → Global Fonts: Inter Tight 300 / 400 / 500 (o cargarla desde `wordpress-loader.php`).
- Site Settings → Global Colors: crear los tokens con los mismos valores para uso en widgets nativos (los valores canónicos siguen siendo los de `:root` en `styles.css`).
- Plugin **Safe SVG** (o el filtro incluido en `wordpress-loader.php`) para subir `favicon.svg` y los ornamentos.

### 3.2 Breakpoints
Elementor → Site Settings → Layout → Breakpoints (Elementor Pro / experimento *Additional Custom Breakpoints*):
- **Mobile: 720 px** (por defecto 767)
- **Tablet: 1100 px** (por defecto 1024)

Así los controles responsive de Elementor coinciden exactamente con las media queries de `styles.css` y no aparecen "zonas grises" entre 720–767 ni 1024–1100 px.

### 3.3 Carga de CSS y JS
Dos vías equivalentes; elegir una:

**A. Child theme (recomendada):** copiar `wordpress-loader.php` en `functions.php`. Encola `styles.css` con dependencia de `elementor-frontend` (para que nuestras reglas se apliquen después) y `main.js` con `defer`, sólo en las páginas del landing.

**B. Elementor Pro → Site Settings → Custom Code:** un snippet en `</head>` con `<link rel="stylesheet" href="…/styles.css">` y otro en `</body>` con `<script src="…/main.js" defer></script>`. Más rápido de montar; menos limpio para versionar.

En ambos casos `styles.css` **no se fragmenta ni se reescribe**: es una sola hoja, ya consolidada y verificada (ver `SITE-AUDIT.md` §10). Las adaptaciones específicas para Elementor van en un archivo aparte (`elementor-form.css` y lo que surja), nunca editando la hoja base.

### 3.4 Neutralizar el CSS de Elementor
Elementor añade márgenes/paddings y estilos a contenedores y widgets. Para que no compitan:
- Contenedores del landing: padding 0, gap 0, ancho 100 %, sin `min-height` salvo el hero (100vh lo aporta nuestro CSS).
- Widgets Heading/Text: sin márgenes propios (dejar que los apliquen nuestras clases).
- Si un estilo de Elementor "gana" por especificidad (`.elementor-widget-container`, `.elementor-element`), se resuelve con una regla puntual en el archivo de adaptaciones, no con `!important` en la hoja base.

---

## 4. Mapa sección por sección

Nomenclatura: **Contenedor** = contenedor Flexbox de Elementor con la clase indicada (Advanced → CSS Classes) y el ID de ancla (Advanced → CSS ID). **HTML** = widget HTML con el snippet. **Nativo** = widget de Elementor con clase asignada.

| # | Sección (`id`) | Cómo construirla | Clases/IDs obligatorios | JS (main.js) | Snippet |
|---|---|---|---|---|---|
| — | Nav + menú móvil | **Header Template** (Theme Builder), sticky. Nativo: Image (logo blanco + logo negro con `.nav__logo--light/--dark`), Nav Menu con clase `nav__links`, enlace CTA `nav__cta`, selectores `nav__lang` y `nav__lang--mobile`. El menú móvil puede ser un **Popup** a pantalla completa o el HTML `#mobileMenu` tal cual. Con Popup, replicar `menu__links` (índice `<i>01</i>`) y `menu__foot`. | `header.nav#nav`, `#navBurger`, `#mobileMenu`, `.menu__links`, `.nav__lang--mobile` | Módulo 2 (`.is-solid`) y 9 (burger). Si el menú es un Popup de Elementor, el módulo 9 no aplica: replicar el cambio de color/logo con las clases `.nav.is-open` | `00-nav-y-menu-movil` |
| 01 | Hero (`#inicio`) | Contenedor `hero` con HTML para `hero__media` (`<picture>` con `hero-mobile.jpg` ≤720) o Image con `srcset`; título H1 con la estructura `.line > span` (3 renglones) — más fiable como HTML; meta, párrafo y dos botones (Nativo Button con clases `btn btn--light` / `btn btn--ghost-light`). | `.hero`, `.hero__media`, `.hero__frame`, `.hero__title .line span`, `.hero__actions`, `.hero__scroll` | Ninguno (animaciones CSS) | `01-hero` |
| 02 | Intro (`#intro`) | Contenedor `intro`. Cabecera: índice `section-index`, H2 `intro__title reveal` (con `<br>` según original), párrafo `intro__lead reveal`, lista `keyline`. Figure `intro__panorama`. Tríptico `intro__themes` como HTML (iconos SVG inline). | `.intro__head`, `.keyline`, `.intro__panorama`, `.intro__themes`, `.theme__icon` | Módulo 1 (títulos) y 2 (reveal) | `02-intro` |
| 03 | Ubicación (`#ubicacion`) | Contenedor `location`. Columna de texto nativa (índice, H2, párrafo) + lista `destinations` (HTML: `li[data-point]`). **Mapa: widget HTML con `mapa-amador.{es,en}.svg` dentro de `<div class="location__map" role="img">`** — ver §6. Cierre `location__close`. | `.location__inner`, `.location__text`, `.destinations li[data-point]`, `.location__map`, `svg.map`, `.map-point[data-point]` | Módulo 2 (hover lista ⇄ punto) | `03-ubicacion-mapa`, `mapa-amador.*.svg` |
| 04 | Residencias (`#residencias`) | Contenedor `residences`. Cabecera nativa; cuerpo como HTML (`residences__body` con `residences__iso`, dos `figure` y el `dl.ledger`). Las Image nativas pueden usarse si mantienen `figure.residences__hero-img` / `figure.residences__detail-img`. | `.residences__body`, `.ledger`, `.residences__iso` | 1, 2 | `04-residencias` |
| 05 | Tipologías (`#tipologias`) | Contenedor `types`. Cabecera nativa; **tabla + figura como HTML** (`a.type-row[data-unit]` con `type-row__figure` para móvil y `types__figure` lateral con 5 `img[data-unit]`). | `.types__inner`, `.types__head`, `.type-row[data-unit]`, `.types__figure img[data-unit]`, `.types__figure-label b` | Módulo 7 (hover desktop / acordeón móvil) | `05-tipologias` |
| 06 | Amenidades (`#amenidades`) | **Sección completa como HTML** (`section.amenities` → `.amenities__pin` sticky → `.amenities__media` con 4 `img[data-amenity]` + `.amenities__inner` con la lista). La altura de 2.6 pantallas y el sticky vienen del CSS. | `.amenities__pin`, `.amenities__media img[data-amenity]`, `li.amenity[data-amenity]`, `.amenity__items` | Módulos 2 (toggle móvil) y 6 (scroll desktop) | `06-amenidades` |
| 07 | Arquitectura (`#arquitectura`) | Contenedor `arch` con `arch__inner`: texto nativo (índice, H2 con 4 `<br>`, párrafo) + `ul.arch__ficha` y `ul.swatches` (HTML) + `figure.arch__strip` (Image). | `.arch__inner`, `.arch__text`, `.arch__title`, `.arch__ficha`, `.swatches`, `.arch__strip` | 1, 2 | `07-arquitectura` |
| 08 | Galería (`#galeria`) | **Grid como HTML** (`#galleryGrid` con `svg.gallery__thread` + 7 `figure.g.g-N` + ornamentos `.orn-1/.orn-2`). Cabecera nativa con `.orn-head` (HTML). Requiere `ornamento-defs.html` en la página. | `#galleryGrid`, `.gallery__thread(-path/-mask/-nodes)`, `.g-1…g-7`, `.orn-*` | Módulo 5 (hilo) | `08-galeria`, `ornamento-defs` |
| 09 | Preguntas (`#preguntas`) | Cabecera nativa; **lista como HTML** (`details.faq__item` > `summary` + `.faq__body`). El widget Accordion de Elementor NO reproduce la animación ni el signo +/×; usar el HTML. | `.faq__list`, `details.faq__item`, `.faq__body` | Módulo 8 | `09-preguntas-faq` |
| 10 | Proyecto (`#proyecto`) | Contenedor `behind behind--dark` con fondo `behind__ground` (Image) y `dl.ledger.ledger--behind` (HTML). | `.behind__inner`, `.behind__head`, `.ledger--behind` | 1, 2 | `10-proyecto` |
| 11 | Contacto (`#contacto`) | Contenedor `contact` de dos columnas: `contact__left` (HTML: ornamento + índice + H2 + `contact__direct`) y `contact__right` con el **formulario** — ver §7. | `.contact__left`, `.orn-contact`, `.contact__right`, `.form` o `.passage-form` | Módulo 2 (validación) sólo si se usa el `<form>` original | `11-contacto` |
| — | Footer | **Footer Template** (Theme Builder) o HTML. `footer__top` (logo + tagline + 3 columnas), `footer__meta`, `footer__bottom` con `footer__lang`. | `.footer`, `.footer__top`, `.footer__nav--cols`, `.footer__lang` | — | `12-footer` |

**Índices de sección** (`section-index`): `<div class="section-index"><span class="idx">02</span><span class="idx-label">Ubicación</span></div>`; variante `--light` sobre fondos oscuros. **Línea de scroll** entre secciones: `<div class="scroll-line scroll-line--dark|--light" aria-hidden="true"><span></span></div>`.

**Títulos escalonados:** `main.js` (módulo 1) transforma cualquier `h2.reveal` en renglones animados respetando los `<br>` del HTML. Basta con que el H2 tenga la clase `reveal` y los mismos `<br>` que el original (o ninguno: el módulo detecta el ajuste de línea real).

---

## 5. Activos

Carpeta `img/` (7.2 MB, 33 archivos), nombres definitivos. Subir a la Media Library **o** copiar en el child theme y mantener las rutas relativas de los snippets (`img/...` → ajustar a la URL final con buscar/reemplazar).

| Grupo | Archivos |
|---|---|
| Hero | `hero.jpg` (1672×941), `hero-mobile.jpg` (940×1882, ≤720px) |
| Intro / Residencias | `intro-panorama.jpg`, `living.jpg`, `terrace-bridge.jpg`, `isotipo-g.png` (marca de agua) |
| Tipologías (isométricos oficiales) | `unit-casia.png`, `unit-almendro.png`, `unit-cedro.png`, `unit-panama.png`, `unit-palma-real.png` |
| Amenidades (fondos) | `am-rooftop.jpg`, `am-wellness.jpg`, `am-social.jpg`, `am-paisaje.jpg` |
| Arquitectura | `arch-facade.jpg`, `mat-porcelanico.jpg`, `mat-cuarzo.jpg`, `mat-roble.jpg` |
| Galería | `g-bedroom.jpg`, `g-bano.jpg`, `g-aerial.jpg`, `g-terrace.jpg`, `g-clubhouse.jpg`, `g-pool.jpg`, `g-architecture.jpg` |
| Proyecto | `behind-dusk.jpg` |
| Marca | `logo-white.png`, `logo-black.png`, `favicon.svg`, `orn-1.svg`, `orn-2.svg`, `orn-3.svg` (máscaras de los ornamentos) |

Recomendación de producción (no altera el diseño): servir WebP/AVIF con `srcset` desde WordPress (Elementor/Imagify/ShortPixel). Mantener `width`/`height` en cada `<img>` (evita CLS) y `loading="lazy"` salvo en el hero (`fetchpriority="high"`).

---

## 6. Idiomas y el mapa — cómo evitar el problema

### 6.1 Estructura
Una página por idioma (`/` ES y `/en/` EN), enlazadas con `hreflang` (ya definido en el `<head>` de ambas). Los selectores `nav__lang`, `nav__lang--mobile` (móvil, siempre visible junto al burger) y `footer__lang` enlazan entre sí. El plugin multilingüe se encarga de duplicar la página, del switch y del `hreflang`; el diseño no cambia.

**Plugins compatibles con Elementor y con esta estrategia:**
- **WPML** (integración oficial con Elementor): traduce los widgets nativos campo a campo y el widget HTML como bloque; permite "Translate Everything" o traducción manual. Es el que menos fricción tiene con Elementor Pro y Theme Builder (headers/footers por idioma).
- **Polylang (+ Polylang for Elementor)**: duplica la página y se edita la copia en EN. Directo y suficiente para dos idiomas.
- **TranslatePress**: traduce el HTML renderizado con un editor visual (incluye texto dentro de SVG inline y atributos `alt`). Útil si se prefiere no duplicar páginas.

Con cualquiera de los tres, el material ya está listo: **los snippets `.en.html` son la página inglesa completa** y `tools/i18n-en.json` / `TRANSLATION-EN.md` son el diccionario (270 cadenas) para cargar en la memoria de traducción del plugin o para comprobar cadena por cadena.

### 6.2 El mapa (sección Ubicación)
Es un SVG inline (900 × 891) con geometría real del Causeway y 16 etiquetas de texto (`<text>`): nombres de lugares, agua, escala y brújula. Preocupación legítima: "¿cómo se traduce un SVG?". Tres vías, de la más simple a la más elegante; cualquiera funciona con los tres plugins.

**Vía A — un SVG por idioma (recomendada, cero riesgo).**
El mapa se inserta en un widget HTML. En la página ES se pega `mapa-amador.es.svg`; en la página EN, `mapa-amador.en.svg`. Como cada idioma es una página distinta (WPML/Polylang), cada una lleva su widget con su SVG. Nada que traducir en el plugin; las 16 etiquetas ya están traducidas y verificadas en ambos archivos. Mantenimiento: si cambia una etiqueta, se edita en los dos archivos (están juntos en `snippets/`).

**Vía B — traducir las etiquetas con el plugin.**
WPML y TranslatePress detectan el contenido del widget HTML como cadenas traducibles; los `<text>` del SVG aparecen como cadenas normales ("Canal de Panamá", "Bahía de Panamá", "Puente de las Américas"…). Se traducen una vez y el plugin sirve la versión correcta. Diccionario: las 16 etiquetas están en `tools/i18n-en.json` y en `TRANSLATION-EN.md` (sección 03 Ubicación).

**Vía C — etiquetas HTML fuera del SVG (sólo si se quiere editar desde Elementor).**
Sustituir cada `<text>` por un `<span>` posicionado en % sobre el contenedor `location__map`. Da edición WYSIWYG, pero exige recalcular posiciones en tres breakpoints. No lo recomendamos: la Vía A resuelve el problema en cinco minutos.

**Lo que no debe hacerse:** rasterizar el mapa a PNG. Se perderían el desvanecido por máscara, el halo animado del marcador, el hover lista ⇄ punto, la nitidez en retina y las etiquetas grandes en móvil.

### 6.3 Cadenas fuera de la página
- Etiquetas del burger: `data-label-open` / `data-label-close` en `#navBurger` (ES: "Abrir menú / Cerrar menú"; EN: "Open menu / Close menu"). `main.js` las lee de ahí.
- Metadatos (`title`, `description`, OG, JSON-LD): en el `<head>` de cada `index.html`; con WPML/Polylang se cargan en Yoast/RankMath por idioma.
- Mensaje de éxito del formulario y opciones del `select`: ver §7.

---

## 7. Formulario y CRM

El landing entrega el formulario como **referencia visual y de UX**: cuatro campos obligatorios (nombre, email, teléfono/WhatsApp, "¿Qué estás buscando?" con 4 opciones), validación, estado de error, mensaje de confirmación y CTA secundaria a WhatsApp. **No tiene backend**; conectar el CRM es responsabilidad de la implementación.

Dos opciones:

**A. Widget Form de Elementor Pro (recomendada).** Permite acciones (email, webhook, HubSpot, ActiveCampaign, Zapier…) sin código. Para que se vea idéntico: asignar la clase `passage-form` al widget y cargar `elementor-form.css` (adapta nuestras reglas a las clases del widget). Campos, `name`s, opciones del select y textos exactos están en `snippets/11-contacto.*.html` y en `CONTENT-AUDIT.md`. Mensaje de éxito: "Gracias — Hemos recibido tu solicitud…" (EN: "Thank you — We have received your request…"). Botón WhatsApp: enlace `wa.me/<número>?text=<mensaje>` con clases `btn btn--outline-green` (el SVG del icono está en el snippet).

**B. `<form>` original en un widget HTML** + endpoint propio (plugin de formularios que acepte HTML custom, o `admin-ajax`/REST). Mantiene el `select` personalizado (`appearance: base-select`) y la validación de `main.js`. Más fiel, más trabajo de integración.

---

## 8. Control de calidad y aceptación

La referencia de aceptación son las dos URLs en vivo. Comparar en estos viewports: **375 × 812, 390 × 844, 768 × 1024, 1024 × 768, 1280 × 800, 1440 × 900, 1920 × 1080**.

Checklist funcional (todos verificados en la referencia; deben cumplirse igual en WordPress):
- [ ] Nav transparente sobre el hero → sólida con logo negro al hacer scroll; burger ≤1100 px; selector ES/EN visible junto al burger en móvil.
- [ ] Menú móvil: abre/cierra por burger, por enlace y con Esc; bloquea el scroll del fondo; cabe completo en 375 × 667.
- [ ] Títulos: cada renglón sube por separado al entrar en pantalla (hero y los 10 `h2`).
- [ ] Ubicación: hover en un destino resalta su punto; mapa con bordes desvanecidos; en móvil ampliado con "PASSAGE AMADOR" ≈ 2× el resto.
- [ ] Tipologías: hover cambia el isométrico y la etiqueta "Modelo" (desktop); acordeón con render dentro de la fila (móvil).
- [ ] Amenidades: sección fijada, el scroll avanza 01→04 y cambia el fondo (desktop); toggle con línea de detalle (móvil).
- [ ] Galería: hilo punteado que se dibuja con el scroll (desktop); esquinas de 20 px alternas; sin hilo en móvil.
- [ ] FAQ: un ítem abierto a la vez, altura animada, + rota a ×.
- [ ] Formulario: error visible al enviar vacío; confirmación con datos válidos; WhatsApp abre en pestaña nueva.
- [ ] Sin scroll horizontal en ningún viewport; sin imágenes deformadas; sin errores en consola.
- [ ] Validación HTML (validator.w3.org) sin errores; `lang` correcto por página; `hreflang` en ambas.
- [ ] Lighthouse móvil: Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 95 (con imágenes en WebP).

Herramientas incluidas en el repositorio (`tools/`): `qa-page.js` (reporte automático de overflow, imágenes rotas, anclas, áreas táctiles), `css-verify.js` (comparación de estilos computados entre dos versiones) y `serve.js`.

---

## 9. Pendientes que debe resolver la implementación / el cliente

| Ítem | Dónde está el placeholder |
|---|---|
| Número de WhatsApp real | `wa.me/50760000000` (menú móvil, contacto, footer) |
| Correo de ventas | `ventas@passagepanama.com` (footer) |
| Dominio definitivo | `passage-amador.vercel.app` en canonical, `hreflang`, OG y JSON-LD de ambas páginas |
| Páginas legales | `#privacidad`, `#cookies`, `#terminos` |
| Redes sociales | Instagram y LinkedIn → `#` |
| Endpoint / CRM del formulario | §7 |
| Confirmación de Cedro 116 m² | Tipologías |
| Fotos de estilo de vida en Amador | bloque diseñado y retirado hasta selección manual; se entregará como snippet cuando existan las fotos |
| `sitemap.xml`, `robots.txt` | los genera el SEO plugin |

---

## 10. Contacto y criterio de dudas

Ante cualquier duda de interpretación, la regla es: **lo que hace la referencia en vivo es lo correcto**. Si algo no se puede reproducir con un widget nativo, se reproduce con el snippet HTML correspondiente; si un estilo de Elementor interfiere, se neutraliza en el archivo de adaptaciones. No se modifican `styles.css` ni `main.js`.

Jonathan Heres · jonathanheres05@gmail.com
