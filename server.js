import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// token secreto que só você sabe
const ADMIN_TOKEN = "SUPERSEGREDO_123456";

io.on("connection", (socket) => {
  console.log("Novo cliente conectado");

  socket.on("adminCmd", ({ token, cmd, payload }) => {
    if (token !== ADMIN_TOKEN) {
      console.log("Tentativa não autorizada");
      return;
    }

    if (cmd === "msg") {
      io.emit("globalMsg", payload);
    }

    if (cmd === "event") {
      io.emit("globalEvent", payload);
    }
  });
});

server.listen(10000, () => {
  console.log("Servidor rodando na porta 10000");
});
