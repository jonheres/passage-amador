const potrace = require("potrace");
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");
const src = path.join(__dirname, "..", "..", "recursos", "Captura de pantalla 2026-09-17 032239.png");
const out = path.join(__dirname, "..", "..", "img");
// manual crops (x, y, w, h) — the three pieces overlap horizontally
const boxes = [[70, 70, 375, 365], [450, 220, 220, 385], [575, 75, 545, 400]];
(async () => {
  const img = await Jimp.read(src);
  console.log("source", img.bitmap.width, img.bitmap.height);
  for (let i = 0; i < boxes.length; i++) {
    const [x, y, w, h] = boxes[i];
    const piece = img.clone().crop(x, y, Math.min(w, img.bitmap.width - x), Math.min(h, img.bitmap.height - y)).greyscale();
    const buf = await piece.getBufferAsync(Jimp.MIME_PNG);
    await new Promise((res, rej) => potrace.trace(buf, { threshold: 190, turdSize: 30, optTolerance: 0.25 }, (err, svg) => {
      if (err) return rej(err);
      const m = svg.match(/d="([^"]+)"/);
      if (!m) { console.log(svg.slice(0, 300)); return rej(new Error("no path")); }
      fs.writeFileSync(path.join(out, `orn-${i + 1}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${piece.bitmap.width} ${piece.bitmap.height}"><path d="${m[1]}" fill="currentColor"/></svg>`);
      console.log(`orn-${i + 1}.svg ${piece.bitmap.width}x${piece.bitmap.height} ${(m[1].length / 1024).toFixed(1)} KB`);
      res();
    }));
  }
})();
