export function crc16(bufOrStr) {
  // Accept string or Buffer
  const buf = typeof bufOrStr === "string" ? Buffer.from(bufOrStr, "utf8") : bufOrStr;
  let crc = 0xFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 0x0001) crc = (crc >>> 1) ^ 0xA001;
      else crc = crc >>> 1;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

