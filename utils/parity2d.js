import { parityBit } from "./parity.js";

export function parity2D(str, blockSize = 8) {
  // Text’i blockSize'a böl ve pad et
  const buf = Buffer.from(str, "utf8");
  const rows = [];

  for (let i = 0; i < buf.length; i += blockSize) {
    const chunk = buf.slice(i, i + blockSize);
    const padded = Buffer.alloc(blockSize, 32); // pad as space (ASCII 32)
    chunk.copy(padded);
    rows.push(padded);
  }

  // Satır paritileri
  const rowParities = rows.map(row => parityBit(row));

  // Sütun paritileri
  const colParities = [];
  for (let col = 0; col < blockSize; col++) {
    let ones = 0;
    for (let row = 0; row < rows.length; row++) {
      const b = rows[row][col];
      ones += b.toString(2).split("1").length - 1;
    }
    colParities.push(ones % 2 === 0 ? 0 : 1);
  }

  return `${rowParities.join("")};${colParities.join("")}`;
}
