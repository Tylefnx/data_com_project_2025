import net from "net";
import { crc16 } from "./utils/crc16.js";
import { parityBit } from "./utils/parity.js";
import { parity2D } from "./utils/parity2d.js"; // EKLENDİ
import { hammingDecode, hammingEncodeString } from "./utils/hamming.js"; // EKLENDİ
import { internetChecksum } from "./utils/checksum.js"; // EKLENDİ

const HOST = "127.0.0.1";
const PORT = 5000;

const client = new net.Socket();

client.connect(PORT, HOST, () => {
  console.log("[Client2] Bekliyorum...");
});

client.on("data", chunk => {
  const packet = chunk.toString();
  const parts = packet.split("|");
  if (parts.length < 3) return console.log("[Client2] Geçersiz paket:", packet);

  // Split işleminde veri içinde | karakteri varsa bozulmaması için:
  const incomingControl = parts.pop();
  const method = parts.pop();
  const data = parts.join("|"); 

  let computed = null;
  let isHammingCorrected = false;
  let hammingText = "";

  switch (method) {
    case "CRC16": computed = crc16(data); break;
    case "PARITY": computed = parityBit(data).toString(); break;
    case "PARITY2D": computed = parity2D(data); break;
    case "CHECKSUM": computed = internetChecksum(data); break; // EKLENDİ
    case "HAMMING":
      // Hamming özel durum: Gelen kontrol verisi (encoded string) çözülür
      const decoded = hammingDecode(incomingControl);
      // Karşılaştırma için decoded text tekrar encode edilir
      computed = hammingEncodeString(decoded.text); 
      isHammingCorrected = decoded.corrected;
      hammingText = decoded.text;
      
      if (decoded.corrected) {
        console.log(`[Hamming] Veri onarıldı! Ham Veri: ${data} -> Onarılan: ${hammingText}`);
      }
      break;
    default:
      console.log("[Client2] Desteklenmeyen method:", method);
      return;
  }

  // Status Belirleme
  let status = "DATA CORRUPTED";
  if (incomingControl === computed) {
    status = "DATA CORRECT";
  } else if (method === "HAMMING" && isHammingCorrected) {
    // Hamming'de kontrol bitleri tutmasa bile onarım yapılmış olabilir
    // Not: Hamming'de logic biraz karışıktır, basitçe:
    status = "DATA CORRECTED (HAMMING)";
  }

  console.log(`--- RAPOR ---
Received Data      : ${data}
Method             : ${method}
Sent Check Bits    : ${incomingControl}
Computed Check Bits: ${computed}
Status             : ${status}
-----------------`);
});
