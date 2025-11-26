import net from "net";
import readline from "readline";
import { crc16 } from "./utils/crc16.js";
import { parityBit } from "./utils/parity.js";
import { parity2D } from "./utils/parity2d.js";
import { hammingEncodeString } from "./utils/hamming.js";
import { internetChecksum } from "./utils/checksum.js";

const HOST = "127.0.0.1";
const PORT = 5000;

// Kullanıcıdan input almak için arayüz
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const client = new net.Socket();

// --- METHOD HARİTASI (NUMARA -> METHOD ADI) ---
const METHOD_MAP = {
  "1": "PARITY",
  "2": "PARITY2D",
  "3": "CRC16",
  "4": "HAMMING",
  "5": "CHECKSUM"
};

client.connect(PORT, HOST, () => {
  console.log(`[Client1] Sunucuya bağlandı (${HOST}:${PORT})`);
  console.log("[Bilgi] Çıkmak için veri kısmına 'exit' yazabilirsin.\n");
  
  askForInput();
});

client.on("error", (err) => {
  console.error("\n[Hata] Sunucu bağlantısı koptu:", err.message);
  process.exit(1);
});

client.on("close", () => {
  console.log("\n[Client1] Bağlantı kapatıldı.");
  process.exit(0);
});

function askForInput() {
  rl.question("Gönderilecek Veri: ", (rawData) => {
    // Çıkış kontrolü
    if (rawData.trim().toLowerCase() === "exit") {
      client.end();
      return;
    }

    // Menüyü göster
    console.log("\n--- Yöntem Seç ---");
    console.log("[1] Parity (Tek/Çift)");
    console.log("[2] 2D Parity (Matris)");
    console.log("[3] CRC16 (Varsayılan)");
    console.log("[4] Hamming Code");
    console.log("[5] Internet Checksum");
    console.log("------------------");

    rl.question("Seçiminiz (1-5): ", (choice) => {
      
      // Haritadan yöntemi bul, yoksa varsayılan CRC16 olsun
      const method = METHOD_MAP[choice.trim()] || "CRC16";
      let control = "";

      try {
        switch (method) {
          case "CRC16":
            control = crc16(rawData);
            break;
          case "PARITY":
            control = parityBit(rawData).toString();
            break;
          case "PARITY2D":
            control = parity2D(rawData);
            break;
          case "HAMMING":
            control = hammingEncodeString(rawData);
            break;
          case "CHECKSUM":
            control = internetChecksum(rawData);
            break;
          default:
            control = crc16(rawData);
            break;
        }

        // Paket formatı: DATA|METHOD|CONTROL
        const packet = `${rawData}|${method}|${control}`;
        
        client.write(packet);
        console.log(`\n>> GÖNDERİLDİ: [${method}] Yöntemi kullanıldı.`);
        console.log(`>> Paket İçeriği: ${packet}`);
        console.log("=======================================================\n");

      } catch (err) {
        console.error("   [HATA] Hesaplama hatası:", err.message);
      }

      // Döngü: Tekrar veri iste
      askForInput();
    });
  });
}
