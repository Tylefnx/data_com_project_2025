import net from "net";
import { crc16 } from "./utils/crc16.js";
import { parityBit } from "./utils/parity.js";

const HOST = "127.0.0.1";
const PORT = 5000;

const [,, rawData = "HELLO", method = "CRC16"] = process.argv;

let control = "";
switch (method) {
  case "CRC16":
    control = crc16(rawData);
    break;
  case "PARITY":
    control = parityBit(rawData);
    break;
  case "PARITY2D":
    control = parity2D(rawData);
    break;
  case "HAMMING":
    control = hammingEncodeString(rawData);
    break;
  default:
    console.error("Desteklenmeyen method! Kullan: CRC16, PARITY, PARITY2D");
    process.exit(1);
}

const packet = `${rawData}|${method}|${control}`;
console.log("[Client1] Gönderilecek paket:", packet);

const client = new net.Socket();
client.connect(PORT, HOST, () => {
  client.write(packet);
  client.end();
});

