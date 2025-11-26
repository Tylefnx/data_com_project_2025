import net from "net";

const HOST = "127.0.0.1";
const PORT = 5000;

// --- YARDIMCI FONKSİYONLAR ---

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

// Rastgele ASCII karakter (yazılabilir karakterler: 32-126 arası)
function randomChar() {
  return String.fromCharCode(32 + randomInt(95));
}

// 1. Bit Flip (Tek Bit Hatası) [cite: 36-37]
function bitFlipInString(s) {
  const buf = Buffer.from(s, "utf8");
  if (buf.length === 0) return s;
  
  const idx = randomInt(buf.length);
  const bit = 1 << randomInt(8);
  buf[idx] = buf[idx] ^ bit; // XOR ile bit çevirme
  
  return buf.toString("utf8");
}

// 2. Character Substitution (Karakter Değiştirme) [cite: 38-39]
function charSubstitution(s) {
  if (s.length === 0) return s;
  const arr = s.split("");
  const i = randomInt(arr.length);
  arr[i] = randomChar();
  return arr.join("");
}

// 3. Character Deletion (Karakter Silme) [cite: 40-42]
function charDeletion(s) {
  if (s.length < 1) return s;
  const i = randomInt(s.length);
  // i. karakter hariç diğerlerini al
  return s.slice(0, i) + s.slice(i + 1);
}

// 4. Random Character Insertion (Rastgele Karakter Ekleme) [cite: 43-45]
function charInsertion(s) {
  const i = randomInt(s.length + 1); // Sona da ekleyebilir
  const char = randomChar();
  return s.slice(0, i) + char + s.slice(i);
}

// 5. Character Swapping (Karakter Yer Değiştirme) [cite: 46-48]
function charSwapping(s) {
  if (s.length < 2) return s;
  const arr = s.split("");
  const i = randomInt(arr.length - 1);
  // Yan yana iki karakteri takas et
  [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
  return arr.join("");
}

// 6. Multiple Bit Flips (Çoklu Bit Hatası) [cite: 49-50]
function multipleBitFlips(s) {
  // Rastgele 2 ile 4 arası bit boz
  let corrupted = s;
  const count = 2 + randomInt(3); 
  for (let i = 0; i < count; i++) {
    corrupted = bitFlipInString(corrupted);
  }
  return corrupted;
}

// 7. Burst Error (Ardışık Karakter Bozma) [cite: 51-52]
function burstError(s) {
  if (s.length < 3) return charSubstitution(s); // Çok kısaysa normal boz
  
  const arr = s.split("");
  // 3 ile 8 arasında bir uzunluk seç, ama string boyunu aşmasın
  const maxBurst = Math.min(8, arr.length);
  const burstLen = 3 + randomInt(maxBurst - 2);
  const start = randomInt(arr.length - burstLen + 1);

  for (let i = 0; i < burstLen; i++) {
    arr[start + i] = randomChar();
  }
  return arr.join("");
}

// Ana Bozma Fonksiyonu
function corrupt(data) {
  const methods = [
    bitFlipInString,    // 1
    charSubstitution,   // 2
    charDeletion,       // 3
    charInsertion,      // 4
    charSwapping,       // 5
    multipleBitFlips,   // 6
    burstError          // 7
  ];
  
  // Rastgele bir yöntem seç
  const selectedMethod = methods[randomInt(methods.length)];
  const corruptedData = selectedMethod(data);
  
  console.log(`[Server Logic] Yöntem: ${selectedMethod.name}`);
  return corruptedData;
}

// --- SERVER YAPISI ---

const sockets = [];

const server = net.createServer(socket => {
  console.log("[Server] Yeni client bağlandı.");
  sockets.push(socket);

  socket.on("end", () => {
    console.log("[Server] Client ayrıldı.");
    const idx = sockets.indexOf(socket);
    if (idx !== -1) sockets.splice(idx, 1);
  });

  socket.on("data", chunk => {
    const packet = chunk.toString();
    console.log(`[Server] Gelen Paket: ${packet}`);

    // Paketi parçala: DATA | METHOD | CONTROL
    // Not: Verinin içinde '|' olma ihtimaline karşı sondan parçalıyoruz
    const parts = packet.split("|");
    
    if (parts.length < 3) {
      console.log("[Server] Hatalı paket formatı, işlem yapılmadı.");
      return;
    }

    const originalControl = parts.pop();
    const method = parts.pop();
    const originalData = parts.join("|"); // Geri kalan her şey datadır

    // Veriyi boz
    const corruptedData = corrupt(originalData);
    
    console.log(`[Server] ${originalData} -> ${corruptedData} (Method: ${method})`);

    // Yeni paketi oluştur (Method ve Control aynı kalır, Data bozulur)
    //: "Server forwards the corrupted data... without breaking packet structure"
    const newPacket = `${corruptedData}|${method}|${originalControl}`;

    // Diğer Client'a gönder (Receiver)
    sockets.forEach(sock => {
      if (sock !== socket) {
        sock.write(newPacket);
      }
    });
  });

  socket.on("error", err => {
    console.error("[Server] Socket hatası:", err.message);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[Server] Listening on ${HOST}:${PORT}`);
});
