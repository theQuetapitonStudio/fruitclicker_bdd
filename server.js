import express from "express";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
const db = new sqlite3.Database("database.sqlite");
const SECRET = "~1bd12192dh"; // troca depois

app.use(cors());
app.use(express.json());

// cria tabela se não existir
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  clicks INTEGER DEFAULT 0
)`);

// registrar
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash], function (err) {
    if (err) return res.status(400).json({ error: "Usuário já existe" });
    res.json({ success: true });
  });
});

// login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (!user) return res.status(400).json({ error: "Usuário não encontrado" });
    if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: "Senha incorreta" });

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });
    res.json({ token });
  });
});

// middleware auth
function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Token ausente" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.userId = decoded.id;
    next();
  });
}

// salvar clicks
app.post("/save", auth, (req, res) => {
  const { clicks } = req.body;
  db.run("UPDATE users SET clicks = ? WHERE id = ?", [clicks, req.userId], (err) => {
    if (err) return res.status(500).json({ error: "Erro ao salvar" });
    res.json({ success: true });
  });
});

// carregar clicks
app.get("/load", auth, (req, res) => {
  db.get("SELECT clicks FROM users WHERE id = ?", [req.userId], (err, row) => {
    if (err) return res.status(500).json({ error: "Erro ao carregar" });
    res.json({ clicks: row ? row.clicks : 0 });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
