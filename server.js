import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Mapeamento de tokens -> email (pode ter mais de 1 admin)
const ADMINS = [
  {
    token: "labatataH0SCH8DC9DH9C912723QDB@@@362FD1102Y7E0H720H7E02H7EXH027DHY2H0X72E", // seu token
    email: "oamost123@gmail.com"
  }
  // { token: "OUTRO_TOKEN", email: "outro@email.com" } // exemplo
];

function findAdminByToken(token) {
  return ADMINS.find(a => a.token === token) || null;
}

io.on("connection", (socket) => {
  socket.on("adminCmd", ({ token, cmd, payload }) => {
    const admin = findAdminByToken(token);
    if (!admin) {
      console.log("adminCmd: token inválido");
      return;
    }

    if (cmd === "msg") {
      io.emit("globalMsg", payload);
      return;
    }

    if (cmd === "event") {
      // só permite spawn se o token pertença ao email desejado
      if (admin.email === "oamost123@gmail.com") {
        io.emit("globalEvent", payload);
      } else {
        console.log(`adminCmd: ${admin.email} tentou spawnar evento sem permissão`);
      }
      return;
    }

    // outros comandos podem ser tratados aqui
  });
});

server.listen(process.env.PORT || 10000, () =>
  console.log("Servidor rodando na porta", process.env.PORT || 10000)
);
