const Jimp = require("jimp"); const path = require("path");
const M = "C:/Users/jonat/AppData/Local/Temp/claude/C--Users-jonat-OneDrive-Desktop-Passage-Mockup/14049eed-5095-4063-aba4-f9b7afdae471/scratchpad/pptx/p/ppt/media/";
const out = path.join(__dirname, "..", "..", "img");
const units = { casia: 84, almendro: 100, cedro: 130, panama: 135, "palma-real": 144 };
(async () => {
  for (const [name, id] of Object.entries(units)) {
    const img = await Jimp.read(M + `image${id}.png`);
    const W = img.bitmap.width, H = img.bitmap.height, d = img.bitmap.data;
    const corner = d[3]; // alpha of the top-left pixel
    if (corner > 0) { // opaque background: flood-fill knockout from the edges
      const px = (i, j) => { const k = (j * W + i) * 4; return [d[k], d[k + 1], d[k + 2]]; };
      const bg = px(1, 1); const tol = 20;
      const isBg = (i, j) => { const c = px(i, j); return Math.abs(c[0] - bg[0]) < tol && Math.abs(c[1] - bg[1]) < tol && Math.abs(c[2] - bg[2]) < tol; };
      const seen = new Uint8Array(W * H), st = [];
      for (let i = 0; i < W; i++) st.push([i, 0], [i, H - 1]); for (let j = 0; j < H; j++) st.push([0, j], [W - 1, j]);
      while (st.length) { const [i, j] = st.pop(); if (i < 0 || j < 0 || i >= W || j >= H) continue; const k = j * W + i; if (seen[k]) continue; seen[k] = 1; if (!isBg(i, j)) continue; d[k * 4 + 3] = 0; st.push([i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]); }
    }
    img.autocrop({ tolerance: 0.01 });
    if (img.bitmap.width > 1100) img.resize(1100, Jimp.AUTO);
    await img.writeAsync(path.join(out, `unit-${name}.png`));
    console.log(name, img.bitmap.width + "x" + img.bitmap.height, "alphaCorner", corner);
  }
})();
