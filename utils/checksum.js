// basit CRC16 placeholder
export function crc16(str) {
  let hash = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      if (hash & 1) hash = (hash >> 1) ^ 0xA001;
      else hash = hash >> 1;
    }
  }
  return hash.toString(16).toUpperCase();
}
