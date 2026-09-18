# PASSAGE AMADOR — Landing

Landing page (desktop + móvil, español) de PASSAGE AMADOR, residencias en la Calzada de Amador, Panamá.

- **Producción (espejo de revisión):** https://jonheres.github.io/passage-amador/
- **Vercel:** https://passage-amador.vercel.app (re-desplegar con `vercel --prod --yes`)

## Estructura

```
index.html      Página completa (ES). en/index.html es la versión EN, generada (no editar a mano). Cada sección lleva un comentario que explica su propósito,
                comportamiento y equivalencia sugerida en Elementor.
styles.css      Hoja consolidada: tokens → componentes en orden de página → media queries
                (≥1101 desktop · ≤1100 tablet · ≤720 móvil) → reduced-motion → keyframes.
                Cada componente lleva una nota de comportamiento.
main.js         Interacciones en vanilla JS (9 módulos independientes, documentados en cabecera).
img/            Activos en uso (renders, isométricos, materiales, logos, ornamentos, favicon).
recursos/       Material fuente del cliente (renders, PDFs, PPTX) y `_unused/` (activos retirados
                y `styles.legacy.css`, la hoja original por rondas).
tools/          Utilidades de desarrollo y QA (ver abajo).
handoff/        Paquete para la implementación en WordPress/Elementor Pro (HANDOFF.md, snippets ES/EN, loader, CSS puente).
SITE-AUDIT.md   Auditoría completa del sitio.
CONTENT-AUDIT.md Inventario literal de textos, enlaces, campos e imágenes (generado).
```

Sin build ni dependencias: se sirve tal cual. Tipografía Inter Tight (Google Fonts). Colores sólo desde los tokens de `:root`.

## Publicar

Cada publicación cambia la versión de caché de `styles.css?v=` y `main.js?v=` en `index.html`, hace commit y push a `main`; GitHub Pages sirve el espejo en ~1 min.

## Herramientas (`tools/`)

| Script | Uso |
|---|---|
| `serve.js` | `node tools/serve.js 8787` — servidor estático local para QA. |
| `i18n.js` | `node tools/i18n.js extract` lista los textos; `node tools/i18n.js build` genera `en/index.html` desde `index.html` + `i18n-en.json` (diccionario ES → EN). Tabla de revisión: `TRANSLATION-EN.md`. |
| `handoff-snippets.js` | Regenera `handoff/snippets/` desde `index.html` y `en/index.html`. |
| `content-audit.js` | `node tools/content-audit.js` — regenera `CONTENT-AUDIT.md`. |
| `css-consolidate.js` | Reconstruye `styles.consolidated.css` a partir de `recursos/_unused/styles.legacy.css` (histórico; `styles.css` ya es la versión consolidada). Usa `qa-dead.json` (selectores sin uso) y `css-notes.json` (notas por componente). |
| `css-verify.js` | Helper de navegador: `qaSnapshot()` / `qaCompare()` comparan los estilos computados de todos los elementos entre dos hojas. Se usó para verificar que la consolidación es idéntica píxel a píxel en 375 / 1000 / 1440 / 1920 px. |
| `qa-page.js` | Helper de navegador: `qaPage()` reporta overflow horizontal, líneas de título recortadas, imágenes rotas, áreas táctiles pequeñas, anclas huérfanas, orden de encabezados, ids duplicados y errores JS. |
| `build-map.js`, `render-map.js`, `osm.json`, `map-data.json` | Generan el mapa SVG de Ubicación a partir de geometría OSM real y POIs verificados. |
| `mobile-preview.html` | Arnés de revisión a 375px (iframe con cache-bust). |

## Pendientes (datos del cliente)

Número de WhatsApp real (`wa.me/50760000000`), correo de ventas, páginas legales (`#privacidad`, `#cookies`, `#terminos`), URLs de redes, versión EN, dominio definitivo (canonical / og:url), confirmación de Cedro 116 m², fotos de estilo de vida en Amador (bloque preparado, retirado hasta selección manual).
