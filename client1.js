import net from 'net';
import { crc16 } from './utils/checksum.js';

const client = new net.Socket();

const data = "HELLO";
const method = "CRC16";
const control = crc16(data);

const packet = `${data}|${method}|${control}`;
console.log("SEND:", packet);

client.connect(5000, "localhost", () => {
  client.write(packet);
  client.end();
});
