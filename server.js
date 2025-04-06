const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

let players = 0;
let turn = 1;
let scores = [0, 0];
let board = [];
let timer = 20;
let timerInterval;

const speciesData = [
  { type: "species", name: "Vaquita" },
  { type: "threat", name: "Bycatch", match: "Vaquita" },
  { type: "solution", name: "Avoid catchinf vaquita", match: "Vaquita" },
  { type: "species", name: "Clownfish" },
  { type: "threat", name: "Bleaching", match: "Clownfish" },
  { type: "solution", name: "Reef Restoration", match: "Clownfish" },
  { type: "species", name: "Turtle" },
  { type: "threat", name: "Plastic", match: "Turtle" },
  { type: "solution", name: "Beach Cleanup", match: "Turtle" },
  { type: "species", name: "Shark" },
  { type: "threat", name: "Overfishing", match: "Shark" },
  { type: "solution", name: "Fishing Ban", match: "Shark" },
];

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}
function startTimer() {
  clearInterval(timerInterval);
  timer = 20;
  io.emit("timerUpdate", timer); // Broadcast initial timer

  timerInterval = setInterval(() => {
    timer--;
    io.emit("timerUpdate", timer);
    if (timer === 0) {
      clearInterval(timerInterval);
      turn = turn === 1 ? 2 : 1;
      io.emit("turnChanged", { turn });
      startTimer(); // Restart for next turn
    }
  }, 1000);
}

  

io.on("connection", (socket) => {
  if (players >= 2) return socket.disconnect();
  players++;
  const playerNumber = players;
  socket.emit("playerNumber", playerNumber);

  if (players === 2) {
    board = shuffle([...speciesData]);
    scores = [0, 0];
    io.emit("startGame", { turn, boardData: board });
    startTimer();
  }

  socket.on("cardClick", ({ index }) => {
    io.emit("revealCard", { index });
  });

  socket.on("updateScore", (newScores) => {
    scores = newScores;
    io.emit("scoreUpdate", scores);
  });

  socket.on("changeTurn", () => {
    turn = turn === 1 ? 2 : 1;
    io.emit("turnChanged", { turn });
    startTimer();
  });

  socket.on("updateBoard", (newBoard) => {
    board = newBoard;
    io.emit("syncBoard", board);
  });

  socket.on("disconnect", () => {
    players--;
    board = [];
    io.emit("playerLeft");
    clearInterval(timerInterval);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});