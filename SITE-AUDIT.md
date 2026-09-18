# PASSAGE AMADOR — Auditoría completa del sitio

**Fecha:** 18 de septiembre de 2026 · **Versión auditada:** commit `main` (115 commits) · **Espejo en vivo:** https://jonheres.github.io/passage-amador/
**Complemento:** [CONTENT-AUDIT.md](CONTENT-AUDIT.md) contiene el inventario literal de todos los textos, enlaces, campos e imágenes en orden de página (regenerable con `node tools/content-audit.js`).

---

## 1. Resumen ejecutivo

| Aspecto | Estado |
|---|---|
| Landing page de una sola página, en español, desktop + móvil | ✅ Completa y publicada |
| Estructura aprobada (mockup `recursos/LANDING PAGE PASSAGE (2).jpg`) | ✅ Implementada en el lenguaje visual propio |
| Copy alineado con la guía de marca (tipografía y colores intactos) | ✅ |
| Formulario de contacto (4 campos, sin CRM) | ✅ Referencia visual/UX; sin envío real |
| Mapa real de Amador (OSM) con puntos verificados | ✅ |
| Versión móvil auditada bloque por bloque | ✅ |
| Datos pendientes del cliente (WhatsApp, correo, legales, FAQ amenidades) | ⏳ Ver §11 |
| Vercel (`passage-amador.vercel.app`) | ⚠️ Desactualizado: bloqueado por límite del plan gratuito desde el 17-sep; GitHub Pages es la referencia |
| Paquete de handoff para el desarrollador WordPress/Elementor | ⏳ Pendiente (se genera al cierre) |

---

## 2. Hosting, repositorio y flujo de publicación

- **Repositorio:** `github.com/jonheres/passage-amador`, rama `main`. Autor de commits: Jonathan Heres.
- **Espejo de revisión (fuente de verdad hoy):** GitHub Pages → https://jonheres.github.io/passage-amador/
- **Vercel:** proyecto `passage-amador` → https://passage-amador.vercel.app . Último deploy previo al bloqueo; volver a correr `vercel --prod --yes` cuando se reinicie la cuota diaria (100 deploys/día en plan Hobby).
- **Cache-busting:** cada publicación cambia `styles.css?v=AAAAMMDDHHMM` y `main.js?v=…` en `index.html`.
- **Puntos de retorno (git tags):**
  - `pre-brand-copy` — antes de la alineación de copy con la guía de marca.
  - `v1-form-simplified` — formulario simplificado a 4 campos.
- Sin build, sin dependencias, sin bundler: el sitio se sirve tal cual.

---

## 3. Stack técnico

| Archivo | Tamaño | Rol |
|---|---|---|
| `index.html` | 84 KB | Página completa (incluye el mapa SVG inline y los ornamentos vectorizados) |
| `styles.css` | 98 KB | Sistema visual + responsive (50 bloques `@media`: 27 × ≤720px, 12 × ≤1100px, 7 × ≥1101px, 3 × reduced-motion) |
| `main.js` | 11 KB | Interacciones (vanilla JS, sin librerías) |
| `img/` | 8.1 MB (35 archivos) | Renders, isométricos, logos, materiales, ornamentos |
| `tools/` | — | `build-map.js` / `render-map.js` / `osm.json` (mapa), `content-audit.js` (auditoría), `mobile-preview.html` (arnés de prueba 375px) |

- **Tipografía:** Inter Tight 300 / 400 / 500 desde Google Fonts (`preconnect` + `display=swap`).
- **Favicon:** SVG inline (data URI) con la "P" sobre negro.
- **Compatibilidad:** CSS moderno (`clamp`, `aspect-ratio`, `mask-image`, `overflow: clip`, `appearance: base-select` con fallback nativo). Chrome/Edge/Safari/Firefox actuales.

---

## 4. Estructura de la página (orden DOM)

| # | Sección | `id` | Fondo | Contenido clave | Menú |
|---|---|---|---|---|---|
| — | Nav fija | `nav` | Transparente → sólido al pasar el hero | Logo, 4 enlaces, ES/EN, CTA, burger (móvil) | — |
| 01 | Hero | `inicio` | `img/hero.jpg` (móvil: `hero-mobile.jpg`) | "Un nuevo capítulo en Amador", coordenadas, 2 CTA | Inicio |
| 02 | Intro | `intro` | Papel | "Donde la ciudad respira", lead, keyline de datos, panorama, tríptico Mar/Ciudad/Naturaleza con iconos finos | — |
| 03 | Ubicación | `ubicacion` | Azul océano | Mapa SVG real de Amador, lista de destinos con tiempos, cierre "La ciudad queda a la vista. El ruido, no." | Ubicación |
| 04 | Residencias | `residencias` | Papel | "Vivir abierto al horizonte", ledger (recámaras / m² / carácter), 2 renders con esquina 20px, isotipo "g" en marca de agua | Residencias |
| 05 | Tipologías | `tipologias` | Papel | "Tu espacio en Amador", 5 modelos (Casia 51 · Almendro 80 · Cedro 116 · Panamá 122 · Palma Real 213 m²) con isométricos | Tipologías (móvil) |
| 06 | Amenidades | `amenidades` | Render a pantalla completa | Paisaje / Rooftop / Wellness / Comunidad con línea de detalle | Estilo de vida |
| 07 | Arquitectura | `arquitectura` | Papel editorial | "Una fachada pensada para la sombra y la brisa", ficha RAWA / LA_AP / EDGE, 3 materiales, render de fachada | Arquitectura (móvil) |
| 08 | Galería | `galeria` | Papel | 7 imágenes con leyendas en tres niveles y "hilo" punteado | Galería (móvil) |
| 09 | Preguntas | `preguntas` | Papel | "Lo que querrás saber", 6 preguntas | — |
| 10 | Proyecto | `proyecto` | `img/behind-dusk.jpg` oscuro | "Quienes lo hacen posible": desarrollador, constructora, banco, etapa, entrega, arquitectura, paisajismo | Proyecto |
| 11 | Contacto | `contacto` | Verde institucional 33% + papel | "Descubre tu próximo capítulo", formulario, WhatsApp | Solicitar información |
| — | Footer | — | Oscuro | Logo, tagline "Entre el Canal, el Pacífico y la ciudad.", 3 columnas, coordenadas, redes, legal | — |

Ornamentos de marca (swashes vectorizados): entre Amenidades→Galería (rotado 90°), en Galería y en el panel verde de Contacto. Marcadores de sección `01…08` con reglas finas.

---

## 5. Sistema visual

**Colores (no modificar — validados con la guía de marca):**

| Token | Valor | Uso |
|---|---|---|
| `--paper` | `#F4F1EB` | Fondo principal (crema) |
| `--paper-2` | `#EDE8DF` | Fondo secundario |
| `--sand` | `#B9A88C` | Reglas y texto terciario |
| `--ink` | `#0E0E0D` | Texto y fondos oscuros |
| `--ocean` / `--ocean-deep` | `#1F4A5C` / `#0F2B36` | Sección Ubicación / mapa |
| `--sunset` | `#D9A16A` | Acento (marcador del mapa, hilo de galería, puntos) |
| `--green` / `--green-deep` | `#2F4A10` / `#24391A` | Verde institucional (panel de contacto, botón WhatsApp) |

**Tipografía:** Inter Tight. Títulos en 300 (light), cuerpo 400, etiquetas/CTA 500 en versalitas con tracking amplio. Escalas con `clamp()`.

**Lenguaje:** reglas de 1px, índices numerados, espacio generoso, imágenes con una sola esquina redondeada (20px), iconos de trazo 1px, sin sombras ni degradados decorativos.

---

## 6. Interacciones y animaciones

| Componente | Desktop | Móvil (≤720px) |
|---|---|---|
| Nav | Transparente sobre el hero, sólida al hacer scroll | Burger → menú a pantalla completa con índice 01–07, CTA y WhatsApp; cierra con Esc o al elegir |
| Títulos (h1 y 9 h2) | Cada renglón visual sube desde su máscara, escalonado 130 ms; se recalcula al cargar fuentes y al redimensionar | Igual (renglones envueltos también se escalonan) |
| Reveal general | Fade + 28px al entrar en viewport (IntersectionObserver) | Igual, 16px |
| Hero | Zoom lento de la imagen; línea de scroll animada | Imagen alternativa vertical |
| Mapa | Hover en lista ⇄ marcador; halo pulsante en Passage; brújula y escala | Escalado 112% con máscaras de desvanecido en los cuatro bordes; etiquetas más grandes (Passage ≈2×) |
| Tipologías | Hover en fila → crossfade del isométrico, etiqueta "Modelo X" | Acordeón: Casia abierta al inicio, tocar otra cierra la anterior y muestra su render debajo |
| Amenidades | Capítulo fijado (sticky, `calc(100vh·2.6)`): el scroll avanza los 4 ítems y cambia el fondo | Toggle: tocar un ítem cambia el fondo y despliega su línea de detalle; Paisaje abierto por defecto |
| Galería | "Hilo" punteado que se dibuja con el scroll uniendo las leyendas | Sin hilo (grid vertical) |
| FAQ | Acordeón animado, uno abierto a la vez, "+" rota a "×" | Igual |
| Formulario | Validación nativa + estado de error por campo; mensaje "Gracias" al enviar; `<select>` personalizado (`appearance: base-select`) con fallback nativo | Igual, campos a ancho completo |
| Accesibilidad de movimiento | `prefers-reduced-motion` desactiva animaciones y scroll suave | Igual |

---

## 7. Responsive — reglas que sostienen la versión móvil

- Breakpoints: `≤1100px` (tablet: hero a una columna, grids simplificados) y `≤720px` (teléfono).
- `html, body { overflow-x: clip }` (nunca `hidden`, rompe el sticky de Amenidades). Sin scroll horizontal verificado a 375px.
- Amenidades deja de estar fijada en móvil (`height: auto`); sin gap con Tipologías.
- Footer a una columna, logo con proporción intacta.
- Hero: meta centrada en una línea, título sin solaparse con los edificios, logo más grande.
- Arnés de prueba: `tools/mobile-preview.html` (iframe 375px con cache-bust).

---

## 8. Inventario de activos

**Imágenes en uso (31):**

| Grupo | Archivos | Peso |
|---|---|---|
| Hero | `hero.jpg`, `hero-mobile.jpg` | 557 KB |
| Intro / Residencias | `intro-panorama.jpg`, `living.jpg`, `terrace-bridge.jpg`, `isotipo-g.png` | 782 KB |
| Tipologías (isométricos hi-res del deck oficial) | `unit-casia/almendro/cedro/panama/palma-real.png` | 2.5 MB |
| Amenidades | `am-paisaje.jpg`, `am-rooftop.jpg`, `am-wellness.jpg`, `am-social.jpg` | 1.3 MB |
| Arquitectura | `arch-facade.jpg`, `mat-travertino/madera/estuco.jpg` | 344 KB |
| Galería | `g-bedroom/detail/aerial/terrace/clubhouse/pool/architecture.jpg` | 1.6 MB |
| Proyecto | `behind-dusk.jpg` | 249 KB |
| Marca | `logo-white.png`, `logo-black.png`, `orn-1/2/3.svg` | 70 KB |

**Sin uso (se pueden eliminar antes del handoff):** `am-marina.jpg` (303 KB), `contact-bg.jpg` (153 KB), `intro-portrait.jpg` (396 KB).

**Origen:** renders del cliente (`recursos/`), isométricos extraídos del PPTX oficial, imágenes complementarias generadas con referencia fiel a los renders. Todas llevan la nota legal "Imágenes referenciales" en el footer.

---

## 9. Formulario de contacto (referencia UX, sin backend)

| Label | `name` | Tipo | Obligatorio |
|---|---|---|---|
| Nombre completo | `nombre` | text (`autocomplete=name`) | sí |
| Email | `email` | email | sí |
| Teléfono / WhatsApp | `telefono` | tel | sí |
| ¿Qué estás buscando? | `interes` | select: `vivir` · `segunda-residencia` · `inversion` · `opciones` | sí |

- Acciones: **Solicitar información** (submit) + **Contactar por WhatsApp** (outline verde, icono fino, `wa.me` con mensaje prellenado).
- Nota legal bajo el formulario + enlace a Política de privacidad.
- Éxito: "Gracias — Hemos recibido tu solicitud…". No hay envío, tracking, HubSpot ni cookies: el vendedor conecta su CRM.

---

## 10. SEO, accesibilidad y rendimiento — hallazgos

**Correcto**
- `<html lang="es">`, 1 `<h1>`, 9 `<h2>` en jerarquía limpia, `title` y `meta description` con la propuesta de valor, Open Graph básico.
- 34 `<img>`: todas con atributo `alt` (17 decorativas con `alt=""`), 21 con `loading="lazy"`; hero con `<picture>` y variante móvil.
- 51 atributos `aria-*` (burger, menú, acordeones, iconos ocultos); navegación por teclado en FAQ, tipologías y menú.
- Sin dependencias externas salvo Google Fonts.

**Recomendaciones antes de producción**
1. `og:image` apunta a `passage-amador.vercel.app`; cambiar al dominio final y añadir `og:url`, `twitter:card`.
2. Peso total de imágenes 8.1 MB: convertir a WebP/AVIF y servir `srcset` por ancho (los PNG de isométricos, 2.5 MB, son los principales candidatos).
3. Alojar Inter Tight localmente si se quiere evitar la dependencia de Google Fonts (privacidad / rendimiento).
4. Añadir `sitemap.xml`, `robots.txt`, `canonical` y datos estructurados (`RealEstateListing` / `Organization`) en el CMS.
5. Enlaces legales (`#privacidad`, `#cookies`, `#terminos`), redes (`#`) y switch ES/EN son placeholders.
6. Verificar contraste de textos secundarios sobre renders (leyendas de amenidades al 60–70% de opacidad) en dispositivos reales.

---

## 11. Pendientes y placeholders (requieren datos del cliente)

| Ítem | Dónde | Valor actual |
|---|---|---|
| Número de WhatsApp | Nav móvil, contacto, footer | `wa.me/50760000000` |
| Correo de ventas | Footer | `ventas@passagepanama.com` |
| Páginas legales | Footer, formulario | `#privacidad`, `#cookies`, `#terminos` |
| Redes sociales | Footer | Instagram y LinkedIn → `#` |
| Versión EN | Nav y footer | Switch visible, sin contenido |
| FAQ · amenidades | Preguntas | "Información en proceso de validación." |
| Superficie de Cedro | Tipologías | 116 m² (por confirmar) |
| Variante de logo | Nav / footer | Se usa "Passage PANAMA"; confirmar si debe ser "Passage AMADOR" |
| Etapa de obra y fechas | Proyecto, FAQ | Según Iván (T3–T4 Q1 2028 · T1–T2 Q3 2029), "sujetas a confirmación" |
| Imágenes sin uso | `img/` | 3 archivos (§8) |

---

## 12. Historial resumido de la iteración

1. Construcción inicial desktop (hero, intro, ubicación, residencias, amenidades, galería, contacto) y publicación GitHub + Vercel.
2. Renders reales, imágenes complementarias fieles a referencia, mapa real OSM con POIs verificados.
3. Ornamentos de marca vectorizados; hilo de galería; capítulo fijado de amenidades.
4. Adopción de la estructura aprobada del mockup (tipologías, arquitectura, FAQ, proyecto) manteniendo el lenguaje propio; pase de densidad para recuperar el "luxury feel".
5. Auditoría móvil bloque por bloque (burger, hero, mapa, acordeones, footer, scroll horizontal).
6. Credenciales reales del proyecto, 5 tipologías oficiales, alineación de copy con la guía de marca, formulario simplificado, FAQ definitiva.
7. Pulido final: dropdown personalizado, contacto con panel verde, mapa móvil (desvanecidos, etiquetas), toggle de amenidades, títulos escalonados por renglón.

---

## 13. Siguiente entregable

**HANDOFF.md** para el desarrollador WordPress/Elementor: mapa sección por sección (qué es nativo de Elementor, qué es CSS a pegar, qué es JS), código listo para copiar, lista de activos con nombres finales, tokens de diseño y lista de "no negociables" (tipografía, colores, esquinas 20px, animaciones de títulos, comportamiento móvil).
