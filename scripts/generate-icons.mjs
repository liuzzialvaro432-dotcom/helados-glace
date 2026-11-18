import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "public/icons");
mkdirSync(outDir, { recursive: true });

/**
 * Creates a solid rounded-square PNG in the brand green.
 */
const createPng = (size) => {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = size * 3 + 1;
  const raw = Buffer.alloc(stride * size);
  const radius = size * 0.22;

  for (let y = 0; y < size; y += 1) {
    raw[y * stride] = 0;
    for (let x = 0; x < size; x += 1) {
      const dx = Math.max(Math.abs(x + 0.5 - size / 2) - (size / 2 - radius), 0);
      const dy = Math.max(Math.abs(y + 0.5 - size / 2) - (size / 2 - radius), 0);
      const outside = dx * dx + dy * dy > radius * radius;
      const offset = y * stride + 1 + x * 3;

      if (outside) {
        raw[offset] = 247;
        raw[offset + 1] = 244;
        raw[offset + 2] = 239;
      } else {
        // Deep teal brand mark
        raw[offset] = 30;
        raw[offset + 1] = 58;
        raw[offset + 2] = 52;
      }
    }
  }

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c;
    }
    return table;
  })();

  const crc32 = (buffer) => {
    let crc = 0xffffffff;
    for (let i = 0; i < buffer.length; i += 1) {
      crc = crcTable[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  };

  const chunk = (type, data) => {
    const typeBuffer = Buffer.from(type);
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
    return Buffer.concat([length, typeBuffer, data, crc]);
  };

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};

for (const size of [16, 32, 48, 128]) {
  writeFileSync(resolve(outDir, `icon-${size}.png`), createPng(size));
}

console.log(`Wrote icons to ${outDir}`);
