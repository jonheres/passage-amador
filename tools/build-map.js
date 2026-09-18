// Builds img/map.svg fragments from real OSM data (coastline + main roads)
// and verified POI coordinates. Run: node tools/build-map.js /tmp/osm.json
const fs = require("fs");
const data = JSON.parse(fs.readFileSync((process.argv[2]||__dirname+"/osm.json"), "utf8"));

// --- bbox & projection (equirectangular, lat-corrected) ---
const latMin = 8.897, latMax = 8.985, lonMin = -79.590, lonMax = -79.500;
const W = 900;
const k = Math.cos((8.94 * Math.PI) / 180);
const H = Math.round((W * (latMax - latMin)) / ((lonMax - lonMin) * k));
const px = (lon) => ((lon - lonMin) / (lonMax - lonMin)) * W;
const py = (lat) => ((latMax - lat) / (latMax - latMin)) * H;
const P = ([lat, lon]) => [px(lon), py(lat)];

// --- coastline chains ---
const coast = data.elements.filter((e) => e.tags && e.tags.natural === "coastline");
const chains = coast.map((w) => w.geometry.map((g) => [g.lat, g.lon]));

// join chains sharing endpoints
const key = (p) => p[0].toFixed(7) + "," + p[1].toFixed(7);
let merged = true;
while (merged) {
  merged = false;
  outer: for (let i = 0; i < chains.length; i++) {
    for (let j = 0; j < chains.length; j++) {
      if (i === j) continue;
      const a = chains[i], b = chains[j];
      if (key(a[a.length - 1]) === key(b[0])) {
        chains[i] = a.concat(b.slice(1)); chains.splice(j, 1); merged = true; break outer;
      }
    }
  }
}

// clip chains to bbox (split where they leave)
const inside = ([lat, lon]) => lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax;
function clipToBox(a, b) { // a inside, b outside -> point on border
  let t = 1;
  const cand = [];
  if (b[0] < latMin) cand.push((a[0] - latMin) / (a[0] - b[0]));
  if (b[0] > latMax) cand.push((latMax - a[0]) / (b[0] - a[0]));
  if (b[1] < lonMin) cand.push((a[1] - lonMin) / (a[1] - b[1]));
  if (b[1] > lonMax) cand.push((lonMax - a[1]) / (b[1] - a[1]));
  t = Math.min(...cand);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
const pieces = [];
for (const ch of chains) {
  let cur = [];
  for (let i = 0; i < ch.length; i++) {
    const p = ch[i], prev = ch[i - 1];
    if (inside(p)) {
      if (prev && !inside(prev)) cur.push(clipToBox(p, prev));
      cur.push(p);
    } else if (prev && inside(prev)) {
      cur.push(clipToBox(prev, p));
      pieces.push(cur); cur = [];
    }
  }
  if (cur.length > 1) pieces.push(cur);
}

// closed rings (islands) vs open (touch border)
const rings = [], open = [];
for (const pc of pieces) (key(pc[0]) === key(pc[pc.length - 1]) ? rings : open).push(pc);

// border walk, counter-clockwise on screen (land is on the LEFT of a coastline way)
// parameterize border position t in [0,4): 0 top-left -> going down left edge? We need CCW on screen:
// CCW on screen: top edge going left, left edge going down, bottom edge going right, right edge going up.
function borderT([lat, lon]) {
  const x = px(lon), y = py(lat);
  const eps = 0.5;
  if (y <= eps) return 0 + (W - x) / W;          // top edge, moving left
  if (x <= eps) return 1 + y / H;                // left edge, moving down
  if (y >= H - eps) return 2 + x / W;            // bottom edge, moving right
  return 3 + (H - y) / H;                        // right edge, moving up
}
function borderPoint(t) {
  t = ((t % 4) + 4) % 4;
  if (t < 1) return [W - (t - 0) * W, 0];
  if (t < 2) return [0, (t - 1) * H];
  if (t < 3) return [(t - 2) * W, H];
  return [W, H - (t - 3) * H];
}
const corners = [0, 1, 2, 3].map((t) => t);
const used = new Set();
const polys = [];
for (let s = 0; s < open.length; s++) {
  if (used.has(s)) continue;
  let poly = [];
  let cur = s;
  let guard = 0;
  while (!used.has(cur) && guard++ < 50) {
    used.add(cur);
    const ch = open[cur];
    poly.push(...ch.map(P));
    const tEnd = borderT(ch[ch.length - 1]);
    // find next chain whose START is the next along the border (CCW) from tEnd
    let best = null, bestD = 9;
    open.forEach((o, idx) => {
      const tS = borderT(o[0]);
      let d = tS - tEnd; if (d <= 0) d += 4;
      if (d < bestD) { bestD = d; best = idx; }
    });
    // add corners passed between tEnd and tStart
    const tStart = tEnd + bestD;
    for (const c of corners) {
      let d = c - tEnd; if (d <= 0) d += 4;
      if (d < bestD) poly.push([...borderPoint(c), c]);
    }
    poly.sort; // no-op, corners appended in order below
    // corners must be in walking order: re-sort the tail segment
    const tail = poly.splice(poly.length - corners.filter((c) => { let d = c - tEnd; if (d <= 0) d += 4; return d < bestD; }).length);
    tail.sort((a, b) => { let da = a[2] - tEnd; if (da <= 0) da += 4; let db = b[2] - tEnd; if (db <= 0) db += 4; return da - db; });
    poly.push(...tail.map((p) => [p[0], p[1]]));
    if (best === s) break;
    cur = best;
  }
  polys.push(poly);
}
for (const r of rings) polys.push(r.map(P));

const fmt = (n) => (Math.round(n * 10) / 10).toString();
const pathOf = (pts) => "M" + pts.map((p) => fmt(p[0]) + " " + fmt(p[1])).join("L") + "Z";
const landPath = polys.map(pathOf).join("");

// --- roads: causeway + bridge + main avenues ---
const roads = data.elements.filter((e) => e.tags && e.tags.highway);
const wanted = (w) => {
  const n = (w.tags.name || "").toLowerCase();
  return n.includes("amador") || n.includes("américas") || n.includes("americas") || n.includes("balboa") || n.includes("cinta") || n.includes("arnulfo") || n.includes("omar torrijos") || w.tags.highway === "trunk" || w.tags.highway === "motorway";
};
const roadPaths = roads.filter(wanted).map((w) => {
  const pts = w.geometry.map((g) => [g.lat, g.lon]).filter(inside).map(P);
  return pts.length > 1 ? "M" + pts.map((p) => fmt(p[0]) + " " + fmt(p[1])).join("L") : "";
}).filter(Boolean).join("");

// --- POIs (verified) ---
const pois = {
  project:  { lat: 8.9385, lon: -79.5495, label: "PASSAGE AMADOR" },
  biomuseo: { lat: 8.93193, lon: -79.54477, label: "Biomuseo" },
  marina:   { lat: 8.91140, lon: -79.52119, label: "Marina de Amador" },
  casco:    { lat: 8.95180, lon: -79.53420, label: "Casco Antiguo" },
  ciudad:   { lat: 8.97049, lon: -79.53049, label: "Ciudad de Panamá" },
  puente:   { lat: 8.94460, lon: -79.56163, label: "Puente de las Américas" },
  ancon:    { lat: 8.95765, lon: -79.54920, label: "Cerro Ancón" },
  naos:     { lat: 8.91513, lon: -79.53238, label: "Isla Naos" },
  flamenco: { lat: 8.9065,  lon: -79.5175, label: "Isla Flamenco" },
  canal:    { lat: 8.9300,  lon: -79.5720, label: "Canal de Panamá" },
  bahia:    { lat: 8.9330,  lon: -79.5150, label: "Bahía de Panamá" },
};
const out = { W, H, landPath, roadPaths, pois: Object.fromEntries(Object.entries(pois).map(([k, v]) => { const [x, y] = P([v.lat, v.lon]); return [k, { x: +fmt(x), y: +fmt(y), label: v.label }]; })) };
fs.writeFileSync(__dirname + "/map-data.json", JSON.stringify(out));
console.log("viewBox", W, H, "polys", polys.length, "land path chars", landPath.length, "roads", roadPaths.length);
console.log(out.pois);
