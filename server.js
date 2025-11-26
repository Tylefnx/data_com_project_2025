import net from 'net';

function corrupt(data) {
  let arr = data.split("");
  const i = Math.floor(Math.random() * arr.length);
  const j = Math.floor(Math.random() * arr.length);
  [arr[i], arr[j]] = [arr[j], arr[i]];
  return arr.join("");
}

const server = net.createServer(socket => {
  socket.on("data", chunk => {
    const packet = chunk.toString();
    const [data, method, ctrl] = packet.split("|");

    const corrupted = corrupt(data);
    const newPacket = `${corrupted}|${method}|${ctrl}`;

    console.log("SERVER YODASIN:", packet, "->", newPacket);

    socket.write(newPacket);
  });
});

server.listen(5000);
