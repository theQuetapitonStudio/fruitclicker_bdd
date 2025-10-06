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

// === HISTÓRICO DE MENSAGENS / EVENTOS ===
const messagesHistory = [];
const eventsHistory = [];
const MAX_HISTORY = 50; // limite de histórico

function findAdminByToken(token) {
  return ADMINS.find(a => a.token === token) || null;
}

// === SOCKET.IO ===
io.on("connection", (socket) => {

  // envia histórico de mensagens para quem conectar
  messagesHistory.forEach(msg => socket.emit("globalMsg", msg));

  // envia histórico de eventos para quem conectar
  eventsHistory.forEach(event => socket.emit("globalEvent", event));

  socket.on("adminCmd", ({ token, cmd, payload }) => {
    const admin = findAdminByToken(token);
    if (!admin) {
      console.log("adminCmd: token inválido");
      return;
    }

    // === MENSAGENS GLOBAIS ===
    if (cmd === "msg") {
      messagesHistory.push(payload);
      if (messagesHistory.length > MAX_HISTORY) messagesHistory.shift(); // remove mais antigas
      io.emit("globalMsg", payload);
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

    // outros comandos futuros aqui...
  });

});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log("Servidor rodando na porta", PORT));
