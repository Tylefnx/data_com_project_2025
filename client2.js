import net from 'net';
import { crc16 } from './utils/checksum.js';

const client = new net.Socket();

client.connect(5000, "localhost", () => {
  console.log("Client 2 listening...");
});

client.on("data", chunk => {
  const packet = chunk.toString();
  const [data, method, incoming] = packet.split("|");

  const computed = crc16(data);

  console.log(`Received Data: ${data}
Method: ${method}
Sent Check Bits: ${incoming}
Computed Check Bits: ${computed}
Status: ${incoming === computed ? "DATA CORRECT" : "DATA CORRUPTED"}`);

  client.end();
});
