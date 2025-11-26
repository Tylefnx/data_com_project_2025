export function parityBit(str) {
  // toplam 1 bit sayısını say
  let ones = 0;
  for (const ch of Buffer.from(str, "utf8")) {
    ones += ch.toString(2).split("1").length - 1;
  }
  return ones % 2 === 0 ? 0 : 1; // EVEN parity
}
