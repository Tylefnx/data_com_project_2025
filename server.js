import net from "net";
import readline from "readline";

const HOST = "127.0.0.1";
const PORT = 5000;

// --- BOZMA FONKSİYONLARI ---

function randomInt(max) { return Math.floor(Math.random() * max); }
function randomChar() { return String.fromCharCode(32 + randomInt(95)); }

// 1. Bit Flip
function bitFlipInString(s) {
  const buf = Buffer.from(s, "utf8");
  if (buf.length === 0) return s;
  const idx = randomInt(buf.length);
  const bit = 1 << randomInt(8);
  buf[idx] = buf[idx] ^ bit;
  return buf.toString("utf8");
}

// 2. Character Substitution
function charSubstitution(s) {
  if (!s.length) return s;
  const arr = s.split("");
  arr[randomInt(arr.length)] = randomChar();
  return arr.join("");
}

// 3. Character Deletion
function charDeletion(s) {
  if (s.length < 1) return s;
  const i = randomInt(s.length);
  return s.slice(0, i) + s.slice(i + 1);
}

// 4. Character Insertion
function charInsertion(s) {
  const i = randomInt(s.length + 1);
  return s.slice(0, i) + randomChar() + s.slice(i);
}

// 5. Character Swapping
function charSwapping(s) {
  if (s.length < 2) return s;
  const arr = s.split("");
  const i = randomInt(arr.length - 1);
  [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
  return arr.join("");
}

// 6. Multiple Bit Flips
function multipleBitFlips(s) {
  let corrupted = s;
  const count = 2 + randomInt(3);
  for (let i = 0; i < count; i++) corrupted = bitFlipInString(corrupted);
  return corrupted;
}

// 7. Burst Error
function burstError(s) {
  if (s.length < 3) return charSubstitution(s);
  const arr = s.split("");
  const len = 3 + randomInt(Math.min(5, arr.length - 3));
  const start = randomInt(arr.length - len + 1);
  for (let i = 0; i < len; i++) arr[start + i] = randomChar();
  return arr.join("");
}

// Fonksiyon Haritası
const CORRUPTION_METHODS = {
  "1": { name: "Bit Flip", fn: bitFlipInString },
  "2": { name: "Char Substitution", fn: charSubstitution },
  "3": { name: "Char Deletion", fn: charDeletion },
  "4": { name: "Char Insertion", fn: charInsertion },
  "5": { name: "Char Swapping", fn: charSwapping },
  "6": { name: "Multiple Bit Flips", fn: multipleBitFlips },
  "7": { name: "Burst Error", fn: burstError },
  "0": { name: "BOZMA (Temiz İlet)", fn: (s) => s }, 
  "R": { name: "Rastgele (Random)", fn: null } 
};

// --- INTERAKTİF ARAYÜZ ---

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const sockets = [];

const server = net.createServer(socket => {
  console.log("[Server] Yeni client bağlandı.");
  sockets.push(socket);

  socket.on("end", () => {
    const idx = sockets.indexOf(socket);
    if (idx !== -1) sockets.splice(idx, 1);
  });

  socket.on("data", chunk => {
    const packet = chunk.toString();
    const parts = packet.split("|");

    if (parts.length < 3) {
      console.log("[Server] Geçersiz paket formatı.");
      return;
    }

    const originalControl = parts.pop();
    const method = parts.pop();
    const originalData = parts.join("|");

    console.log(`\n============== YENİ PAKET GELDİ ==============`);
    console.log(`Veri: "${originalData}" | Yöntem: ${method}`);
    console.log(`----------------------------------------------`);
    console.log(`[1] Bit Flip          [5] Char Swapping`);
    console.log(`[2] Substitution      [6] Multiple Bits`);
    console.log(`[3] Deletion          [7] Burst Error`);
    console.log(`[4] Insertion         [0] BOZMA (Temiz)`);
    console.log(`[R] RASTGELE SEÇ`);
    
    rl.question(`Seçiminiz nedir? > `, (choice) => {
      let selected = CORRUPTION_METHODS[choice.trim().toUpperCase()];
      
      // Geçersiz seçimse veya R ise Rastgele seç
      if (!selected || choice.toUpperCase() === "R") {
        const keys = Object.keys(CORRUPTION_METHODS).filter(k => k !== "0" && k !== "R");
        const randomKey = keys[randomInt(keys.length)];
        selected = CORRUPTION_METHODS[randomKey];
        console.log(`[Otomatik] Seçilen yöntem: ${selected.name}`);
      } else {
        console.log(`[Manuel] Seçilen yöntem: ${selected.name}`);
      }

      // Veriyi boz
      const corruptedData = selected.fn(originalData);

      // Paketi yeniden oluştur
      const newPacket = `${corruptedData}|${method}|${originalControl}`;

      console.log(`İletiliyor: "${originalData}" -> "${corruptedData}"`);
      console.log(`==============================================\n`);

      // Client 2'ye (veya diğerlerine) gönder
      sockets.forEach(sock => {
        if (sock !== socket) sock.write(newPacket);
      });
    });
  });

  socket.on("error", err => console.error("[Server] Hata:", err.message));
});

server.listen(PORT, HOST, () => {
  console.log(`[Server] ${HOST}:${PORT} üzerinde dinleniyor...`);
  console.log("[Bilgi] Paket geldiğinde menü açılacaktır.");
});
