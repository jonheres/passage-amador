// Renders the final inline SVG for the location section from map-data.json
const fs = require("fs");
const path = require("path");
const raw = JSON.parse(fs.readFileSync(path.join(__dirname, "osm.json"), "utf8"));
require("./build-map.js"); // regenerates map-data.json
const d = JSON.parse(fs.readFileSync(path.join(__dirname, "map-data.json"), "utf8"));

// --- simplify paths (RDP) ---
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let maxD = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const dist = Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / Math.hypot(dx, dy || 1e-9);
    if (dist > maxD) { maxD = dist; idx = i; }
  }
  if (maxD > eps) return rdp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(pts.slice(idx), eps));
  return [a, b];
}
const parsePath = (s) => s.split("M").filter(Boolean).map((seg) => seg.replace("Z", "").split("L").map((p) => p.split(" ").map(Number)));
const toPath = (polys, close) => polys.map((p) => "M" + p.map((q) => q[0].toFixed(1) + " " + q[1].toFixed(1)).join("L") + (close ? "Z" : "")).join("");
const land = toPath(parsePath(d.landPath).map((p) => rdp(p, 0.7)).filter((p) => p.length > 3), true);

// roads: keep only meaningful named ones
const roadWays = raw.elements.filter((e) => e.tags && e.tags.highway);
const latMin = 8.897, latMax = 8.985, lonMin = -79.590, lonMax = -79.500;
const k = Math.cos((8.94 * Math.PI) / 180);
const H = d.H, W = d.W;
const P = (g) => [((g.lon - lonMin) / (lonMax - lonMin)) * W, ((latMax - g.lat) / (latMax - latMin)) * H];
const inside = (g) => g.lat >= latMin && g.lat <= latMax && g.lon >= lonMin && g.lon <= lonMax;
const pick = (re) => toPath(roadWays.filter((w) => re.test((w.tags.name || "").toLowerCase())).map((w) => rdp(w.geometry.filter(inside).map(P), 0.8)).filter((p) => p.length > 1), false);
const causeway = pick(/calzada de amador|amador causeway|avenida amador/);
const bridge = pick(/puente de las am[eé]ricas/);
const avenues = pick(/balboa|cinta costera|arnulfo arias|omar torrijos|ascanio|de los m[aá]rtires|avenida central|via espa/);

const p = d.pois;
const lab = (id, x, y, text, anchor = "start", cls = "") => `<g class="map-point ${cls}" data-point="${id}"><circle cx="${x}" cy="${y}" r="3.5"/><text x="${x + (anchor === "end" ? -11 : 11)}" y="${y + 4}" text-anchor="${anchor}">${text}</text></g>`;
const water = (x, y, text, rot = 0) => `<text class="map-water" x="${x}" y="${y}" text-anchor="middle" transform="rotate(${rot} ${x} ${y})">${text}</text>`;
const soft = (x, y, text) => `<text class="map-soft" x="${x}" y="${y}" text-anchor="middle">${text}</text>`;

// scale bar: 1 km in px
const kmPx = (1 / (111.32 * k)) / (lonMax - lonMin) * W;

const svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMaxYMid meet" xmlns="http://www.w3.org/2000/svg" class="map">
  <defs>
    <pattern id="seaDots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.7" fill="rgba(244,241,235,0.09)"/></pattern>
    <pattern id="landLines" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="rgba(244,241,235,0.045)" stroke-width="1"/></pattern>
    <radialGradient id="projectGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#D9A16A" stop-opacity=".35"/><stop offset="1" stop-color="#D9A16A" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#seaDots)"/>
  <g class="map-land-g">
    <path class="map-land" d="${land}"/>
    <path class="map-land-tex" d="${land}"/>
  </g>
  <g class="map-roads"><path d="${avenues}"/></g>
  <path class="map-causeway" d="${causeway}"/>
  <path class="map-bridge" d="${bridge}"/>
  <g class="map-rings">
    <circle cx="${p.project.x}" cy="${p.project.y}" r="${kmPx}"/>
    <circle cx="${p.project.x}" cy="${p.project.y}" r="${kmPx * 2}"/>
    <circle cx="${p.project.x}" cy="${p.project.y}" r="${kmPx * 3}"/>
    <text x="${p.project.x + kmPx * 0.72}" y="${p.project.y - kmPx * 0.72}">1 km</text>
    <text x="${p.project.x + kmPx * 1.44}" y="${p.project.y - kmPx * 1.44}">2 km</text>
    <text x="${p.project.x + kmPx * 2.14}" y="${p.project.y - kmPx * 2.14}">3 km</text>
  </g>
  ${water(438, 615, "Canal de Panamá", 57)}
  ${water(745, 560, "Bahía de Panamá")}
  ${water(430, 840, "Océano Pacífico")}
  ${soft(p.ancon.x, p.ancon.y, "Cerro Ancón")}
  ${soft(p.naos.x + 4, p.naos.y + 30, "Isla Naos")}
  ${soft(p.flamenco.x - 10, p.flamenco.y + 34, "Isla Flamenco")}
  ${lab("puente", p.puente.x, p.puente.y, "Puente de las Américas", "end", "map-point--soft")}
  ${lab("biomuseo", p.biomuseo.x, p.biomuseo.y, "Biomuseo")}
  ${lab("marina", p.marina.x, p.marina.y, "Marina de Amador", "end")}
  ${lab("casco", p.casco.x, p.casco.y, "Casco Antiguo")}
  ${lab("ciudad", p.ciudad.x, p.ciudad.y, "Ciudad de Panamá", "start")}
  <g class="map-point map-point--causeway" data-point="causeway"><text x="${(p.biomuseo.x + p.naos.x) / 2 + 22}" y="${(p.biomuseo.y + p.naos.y) / 2}" transform="rotate(53 ${(p.biomuseo.x + p.naos.x) / 2 + 22} ${(p.biomuseo.y + p.naos.y) / 2})" text-anchor="middle">Causeway de Amador</text></g>
  <g class="map-project">
    <circle cx="${p.project.x}" cy="${p.project.y}" r="34" class="map-project__glow"/>
    <circle cx="${p.project.x}" cy="${p.project.y}" r="16" class="map-project__halo"/>
    <circle cx="${p.project.x}" cy="${p.project.y}" r="5"/>
    <text x="${p.project.x}" y="${p.project.y - 24}" text-anchor="middle">Passage Amador</text>
  </g>
  <g class="map-scale" transform="translate(${W - 40 - kmPx}, ${H - 175})">
    <line x1="0" y1="0" x2="${kmPx.toFixed(1)}" y2="0"/><line x1="0" y1="-4" x2="0" y2="4"/><line x1="${kmPx.toFixed(1)}" y1="-4" x2="${kmPx.toFixed(1)}" y2="4"/>
    <text x="${(kmPx / 2).toFixed(1)}" y="16" text-anchor="middle">1 km</text>
  </g>
  <g class="map-compass" transform="translate(${W - 40}, ${H - 250})"><line x1="0" y1="-16" x2="0" y2="16"/><line x1="-16" y1="0" x2="16" y2="0"/><text x="0" y="-22" text-anchor="middle">N</text></g>
</svg>`;

// inject into index.html between the map container's open tag and its closing
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const start = html.indexOf('<div class="location__map"');
const openEnd = html.indexOf(">", start) + 1;
const end = html.indexOf("</svg>", start) + "</svg>".length;
const next = html.slice(0, openEnd) + "\n      " + svg.replace(/\n/g, "\n      ") + "\n    " + html.slice(end).replace(/^\s*\n/, "");
fs.writeFileSync(path.join(__dirname, "..", "index.html"), next);
console.log("map injected:", (svg.length / 1024).toFixed(1), "KB; 1 km =", kmPx.toFixed(1), "px");
