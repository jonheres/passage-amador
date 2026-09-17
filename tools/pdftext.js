// Crude PDF text extractor: inflates FlateDecode streams and pulls Tj/TJ strings.
const fs = require("fs"), zlib = require("zlib");
const buf = fs.readFileSync(process.argv[2]);
const s = buf.toString("latin1");
const out = [];
const re = /(?<!end)stream\r?\n/g;
let m;
while ((m = re.exec(s))) {
  const start = m.index + m[0].length;
  const end = s.indexOf("endstream", start);
  if (end < 0) break;
  const dictStart = s.lastIndexOf("<<", m.index);
  const dict = s.slice(dictStart, m.index);
  if (!/FlateDecode/.test(dict) || /\/Subtype\s*\/Image/.test(dict)) { re.lastIndex = end; continue; }
  let txt;
  try { txt = zlib.inflateSync(buf.subarray(start, end), { finishFlush: zlib.constants.Z_SYNC_FLUSH }).toString("latin1"); }
  catch (e) { try { txt = zlib.inflateSync(buf.subarray(start, end - 1)).toString("latin1"); } catch (e2) { re.lastIndex = end; continue; } }
  if (!/T[jJ]/.test(txt)) { re.lastIndex = end; continue; }
  const parts = [];
  const tj = /\[((?:[^\]\\]|\\.)*)\]\s*TJ|\(((?:[^)\\]|\\.)*)\)\s*Tj/g;
  let t;
  while ((t = tj.exec(txt))) {
    if (t[1] !== undefined) {
      const strs = [...t[1].matchAll(/\(((?:[^)\\]|\\.)*)\)/g)].map((x) => x[1]);
      parts.push(strs.join(""));
    } else parts.push(t[2]);
  }
  if (parts.length) out.push(parts.join(" ").replace(/\\\(/g, "(").replace(/\\\)/g, ")").replace(/\\\\/g, "\\"));
  re.lastIndex = end;
}
fs.writeFileSync(process.argv[3], out.join("\n\n"), "latin1");
console.log("chunks", out.length, "chars", out.join("").length);
