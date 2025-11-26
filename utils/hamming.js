function parityBits(bits) {
  return bits.reduce((a,b)=>a+(b?1:0),0) % 2;
}

// Gelen 4-bit nibble → 7-bit Hamming encode
export function hammingEncodeNibble(n) {
  const d = [
    (n >> 3) & 1, // d1 MSB
    (n >> 2) & 1, // d2
    (n >> 1) & 1, // d3
    n & 1         // d4 LSB
  ];
  // Bit positions: 1:P1, 2:P2, 3:D1, 4:P4, 5:D2, 6:D3, 7:D4
  const h = [0,0, d[0], 0, d[1], d[2], d[3]];

  // Calculate parity bits
  h[0] = parityBits([h[0],h[2],h[4],h[6]]);           // P1: 1,3,5,7
  h[1] = parityBits([h[1],h[2],h[5],h[6]]);           // P2: 2,3,6,7
  h[3] = parityBits([h[3],h[4],h[5],h[6]]);           // P4: 4,5,6,7

  return h; // array of 7 bits
}

// Düzeltme + decode (tek bit error fix)
export function hammingDecodeBlock(h) {
  // Copy
  const b = [...h];

  // error check: P1, P2, P4
  const p1 = parityBits([b[0],b[2],b[4],b[6]]);
  const p2 = parityBits([b[1],b[2],b[5],b[6]]);
  const p4 = parityBits([b[3],b[4],b[5],b[6]]);

  const syndrome = (p4 << 2) | (p2 << 1) | p1;

  // Eğer syndrome != 0 ise tek bit hatası var, düzelt
  if (syndrome !== 0) {
    const idx = syndrome - 1;
    b[idx] = b[idx] ^ 1; // flip
  }

  // decode nibble
  const d1 = b[2], d2 = b[4], d3 = b[5], d4 = b[6];
  const nibble = (d1 << 3) | (d2 << 2) | (d3 << 1) | d4;

  return { nibble, corrected: syndrome !== 0 };
}

// tüm string encode (ASCII)
export function hammingEncodeString(str) {
  const buf = Buffer.from(str, "utf8");
  const blocks = [];
  for (const byte of buf) {
    const hi = (byte >> 4) & 0xF;
    const lo = byte & 0xF;
    blocks.push(hammingEncodeNibble(hi));
    blocks.push(hammingEncodeNibble(lo));
  }
  // flatten bits as string
  return blocks.map(b=>b.join("")).join(",");
}

// decode full encoded string
export function hammingDecode(encoded) {
  const blocks = encoded.split(",").filter(Boolean);
  const bytes = [];
  let correctedFlag = false;

  for (let i = 0; i < blocks.length; i += 2) {
    const b1 = blocks[i].split("").map(Number);
    const b2 = blocks[i+1].split("").map(Number);
    const d1 = hammingDecodeBlock(b1);
    const d2 = hammingDecodeBlock(b2);
    correctedFlag = correctedFlag || d1.corrected || d2.corrected;
    const byte = (d1.nibble << 4) | d2.nibble;
    bytes.push(byte);
  }

  return {
    text: Buffer.from(bytes).toString("utf8"),
    corrected: correctedFlag
  };
}
