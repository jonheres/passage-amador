const Jimp = require("jimp");
require("jpeg-js").decode; const jpeg = require("jpeg-js"); Jimp.decoders["image/jpeg"] = (data) => jpeg.decode(data, { maxMemoryUsageInMB: 1024 });
const path = require("path");
const src = path.join(__dirname, "..", "..", "recursos", "LANDING PAGE PASSAGE (2).jpg");
const out = path.join(__dirname, "..", "..", "img");
// crops in original pixels [x, y, w, h]
const units = {
  casia:    [340, 3620, 620, 625],
  almendro: [1050, 4310, 620, 515],
  panama:   [380, 4900, 640, 760],
};
(async () => {
  const img = await Jimp.read(src);
  for (const [name, [x, y, w, h]] of Object.entries(units)) {
    const p = img.clone().crop(x, y, w, h);
    const W = p.bitmap.width, H = p.bitmap.height, d = p.bitmap.data;
    // background sample: average of the four corners
    const px = (i, j) => { const k = (j * W + i) * 4; return [d[k], d[k + 1], d[k + 2]]; };
    const corners = [px(2, 2), px(W - 3, 2), px(2, H - 3), px(W - 3, H - 3)];
    const bg = corners.reduce((a, c) => a.map((v, i) => v + c[i] / 4), [0, 0, 0]);
    const tol = 22;
    const isBg = (i, j) => { const c = px(i, j); return Math.abs(c[0] - bg[0]) < tol && Math.abs(c[1] - bg[1]) < tol && Math.abs(c[2] - bg[2]) < tol; };
    const seen = new Uint8Array(W * H); const stack = [];
    for (let i = 0; i < W; i++) { stack.push([i, 0], [i, H - 1]); }
    for (let j = 0; j < H; j++) { stack.push([0, j], [W - 1, j]); }
    while (stack.length) {
      const [i, j] = stack.pop();
      if (i < 0 || j < 0 || i >= W || j >= H) continue;
      const k = j * W + i; if (seen[k]) continue; seen[k] = 1;
      if (!isBg(i, j)) continue;
      d[k * 4 + 3] = 0;
      stack.push([i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]);
    }
    // soften the silhouette: partially fade pixels adjacent to transparent ones
    const alpha = new Uint8Array(W * H); for (let k = 0; k < W * H; k++) alpha[k] = d[k * 4 + 3];
    for (let j = 1; j < H - 1; j++) for (let i = 1; i < W - 1; i++) {
      const k = j * W + i; if (alpha[k] === 0) continue;
      const n = alpha[k - 1] + alpha[k + 1] + alpha[k - W] + alpha[k + W];
      if (n < 4 * 255) d[k * 4 + 3] = Math.round((n / 4 + 255) / 2);
    }
    p.autocrop({ tolerance: 0, cropOnlyFrames: false });
    await p.writeAsync(path.join(out, `unit-${name}.png`));
    console.log(name, p.bitmap.width + "x" + p.bitmap.height);
  }
})();
