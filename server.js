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
  const now = Date.now();

  // Envia só mensagens ainda válidas
  messagesHistory
    .filter(msg => !msg.expiresAt || msg.expiresAt > now)
    .forEach(msg => socket.emit("globalMsg", msg.text));

  // Envia só eventos ainda válidos
  eventsHistory
    .filter(event => !event.expiresAt || event.expiresAt > now)
    .forEach(event => socket.emit("globalEvent", event.payload));

  socket.on("adminCmd", ({ token, cmd, payload }) => {
    const admin = findAdminByToken(token);
    if (!admin) {
      console.log("adminCmd: token inválido");
      return;
    }

    // === MENSAGENS GLOBAIS ===
    if (cmd === "msg") {
      const duration = 5000; // 5 segundos
      const expiresAt = Date.now() + duration;

      const msgObj = { text: payload, expiresAt };
      messagesHistory.push(msgObj);
      if (messagesHistory.length > MAX_HISTORY) messagesHistory.shift();

      io.emit("globalMsg", payload);

      // Remove depois do tempo
      setTimeout(() => {
        messagesHistory = messagesHistory.filter(m => m !== msgObj);
      }, duration);

      return;
    }

    // === EVENTOS GLOBAIS ===
    if (cmd === "event") {
      if (admin.email === "oamost123@gmail.com") {
        const duration = 5000; // também dura 5 segundos
        const expiresAt = Date.now() + duration;

        const eventObj = { payload, expiresAt };
        eventsHistory.push(eventObj);
        if (eventsHistory.length > MAX_HISTORY) eventsHistory.shift();

        io.emit("globalEvent", payload);

        // Remove depois do tempo
        setTimeout(() => {
          eventsHistory = eventsHistory.filter(e => e !== eventObj);
        }, duration);
      } else {
        console.log(`adminCmd: ${admin.email} tentou spawnar evento sem permissão`);
      }
      return;
    }
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log("Servidor rodando na porta", PORT));
