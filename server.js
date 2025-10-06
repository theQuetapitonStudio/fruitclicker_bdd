import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// === ADMINS ===
const ADMINS = [
  {
    token: "labatataH0SCH8DC9DH9C912723QDB@@@362FD1102Y7E0H720H7E02H7EXH027DHY2H0X72E",
    email: "oamost123@gmail.com"
  }
];

// === HISTÓRICO ===
let messagesHistory = [];
let eventsHistory = [];
const MAX_HISTORY = 50;

function findAdminByToken(token) {
  return ADMINS.find(a => a.token === token) || null;
}

// === SOCKET.IO ===
io.on("connection", (socket) => {
  // envia só mensagens ainda válidas (não expiradas)
  const now = Date.now();
  messagesHistory
    .filter(msg => !msg.expiresAt || msg.expiresAt > now)
    .forEach(msg => socket.emit("globalMsg", msg.text));

  eventsHistory.forEach(event => socket.emit("globalEvent", event));

  socket.on("adminCmd", ({ token, cmd, payload }) => {
    const admin = findAdminByToken(token);
    if (!admin) {
      console.log("adminCmd: token inválido");
      return;
    }

    // === MENSAGENS GLOBAIS ===
    if (cmd === "msg") {
      const duration = 5000; // 5 segundos (ou o mesmo usado no front)
      const expiresAt = Date.now() + duration;

      const msgObj = { text: payload, expiresAt };
      messagesHistory.push(msgObj);

      if (messagesHistory.length > MAX_HISTORY) messagesHistory.shift();

      io.emit("globalMsg", payload);

      // remove depois do tempo expirar
      setTimeout(() => {
        messagesHistory = messagesHistory.filter(m => m !== msgObj);
      }, duration);

      return;
    }

    // === EVENTOS GLOBAIS ===
    if (cmd === "event") {
      if (admin.email === "oamost123@gmail.com") {
        eventsHistory.push(payload);
        if (eventsHistory.length > MAX_HISTORY) eventsHistory.shift();
        io.emit("globalEvent", payload);
      } else {
        console.log(`adminCmd: ${admin.email} tentou spawnar evento sem permissão`);
      }
      return;
    }
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log("Servidor rodando na porta", PORT));
