export function internetChecksum(str) {
  const buf = Buffer.from(str, "utf8");
  let sum = 0;

  // 16-bit bloklar halinde topla
  for (let i = 0; i < buf.length; i += 2) {
    // Son byte tek kalırsa padding yap
    let word = (buf[i] << 8) + (buf[i + 1] || 0);
    sum += word;
  }

  // Taşmaları (carry) ekle
  while (sum > 0xFFFF) {
    sum = (sum & 0xFFFF) + (sum >>> 16);
  }

  // 1'e tümleyenini al (Bitwise NOT)
  return (~sum & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
}
