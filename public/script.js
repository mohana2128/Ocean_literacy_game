const socket = io();
let playerNumber = null;
let currentTurn = null;
let timer = 20;
let timerInterval;
let flipped = [];
let board = [];
let scores = [0, 0];

const speciesData = [
  { type: "species", name: "Vaquita" },
  { type: "threat", name: "Bycatch", match: "Vaquita" },
  { type: "solution", name: "Avoid catching vaquita", match: "Vaquita" },
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

function getEmoji(card) {
  if (card.name.includes("Vaquita")) return "🐬";
  if (card.name.includes("Clownfish")) return "🐠";
  if (card.name.includes("Turtle")) return "🐢";
  if (card.name.includes("Shark")) return "🦈";
  if (card.type === "threat") return "⚠️";
  if (card.type === "solution") return "💡";
  return "❓";
}

function createBoard() {
  board = shuffle([...speciesData]);
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";
  board.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.dataset.index = index;
    cardDiv.innerHTML = `
      <div class="card-inner">
        <div class="card-front">❓</div>
        <div class="card-back">${getEmoji(card)}<br>${card.name}</div>
      </div>
    `;
    boardDiv.appendChild(cardDiv);
  });
}

function startTimerDisplay(seconds) {
    document.getElementById("timer").innerText = currentTurn === playerNumber
      ? `⏱️ ${seconds}`
      : `⏳ Opponent's turn (${seconds}s)`;
  }
  socket.on("timerUpdate", (seconds) => {
    startTimerDisplay(seconds);
  });
    

function updateScores() {
  document.getElementById("score").innerText =
    `Player 1: ${scores[0]} | Player 2: ${scores[1]}`;
}

socket.on("playerNumber", (num) => {
  playerNumber = num;
  document.getElementById("status").innerText = `You are Player ${num}`;
});

socket.on("startGame", ({ turn, boardData }) => {
    board = boardData;
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";
  
    board.forEach((card, index) => {
      const cardDiv = document.createElement("div");
      cardDiv.className = "card";
      cardDiv.dataset.index = index;
      cardDiv.innerHTML = `
        <div class="card-inner">
          <div class="card-front">❓</div>
          <div class="card-back">${getEmoji(card)}<br>${card.name}</div>
        </div>
      `;
      boardDiv.appendChild(cardDiv);
    });
  
    currentTurn = turn;
    document.getElementById("status").innerText = `Game started! Player ${turn}'s turn`;
    startTimer();
  });
  

  document.getElementById("board").addEventListener("click", (e) => {
    const cardEl = e.target.closest(".card");
    if (!cardEl || cardEl.classList.contains("matched")) return;
    if (currentTurn !== playerNumber || flipped.length >= 2) return;
  
    const idx = parseInt(cardEl.dataset.index);
    const card = board[idx];
    if (flipped.find(f => f.idx === idx)) return;
  
    cardEl.classList.add("flipped");
    flipped.push({ idx, ...card });
    socket.emit("cardClick", { index: idx });
  
    if (flipped.length === 2) {
      setTimeout(() => {
        const [a, b] = flipped;
        let match = false;
        let scoreDelta = 0;
        let speciesName = null;
        let matchType = ""; // "solution" or "threat"
  
        // Species + Solution Match
        if (a.type === "species" && b.type === "solution" && b.match === a.name) {
          match = true;
          scoreDelta = 2;
          speciesName = a.name;
          matchType = "solution";
        } else if (b.type === "species" && a.type === "solution" && a.match === b.name) {
          match = true;
          scoreDelta = 2;
          speciesName = b.name;
          matchType = "solution";
        }
  
        // Species + Threat Match
        else if (a.type === "species" && b.type === "threat" && b.match === a.name) {
          match = true;
          scoreDelta = -2;
          speciesName = a.name;
          matchType = "threat";
        } else if (b.type === "species" && a.type === "threat" && a.match === b.name) {
          match = true;
          scoreDelta = -2;
          speciesName = b.name;
          matchType = "threat";
        }
  
        if (match) {
          scores[playerNumber - 1] += scoreDelta;
          socket.emit("updateScore", scores);
  
          // Mark the two flipped cards
          board[a.idx].matched = true;
          board[b.idx].matched = true;
          document.querySelector(`[data-index="${a.idx}"]`).classList.add("matched");
          document.querySelector(`[data-index="${b.idx}"]`).classList.add("matched");
  
          // If solution matched → hide threat too
          if (matchType === "solution") {
            const threatIndex = board.findIndex(card =>
              card.type === "threat" && card.match === speciesName && !card.matched
            );
            if (threatIndex !== -1) {
              board[threatIndex].matched = true;
              document.querySelector(`[data-index="${threatIndex}"]`).classList.add("matched");
            }
          }
  
          // If threat matched → hide solution too
          if (matchType === "threat") {
            const solutionIndex = board.findIndex(card =>
              card.type === "solution" && card.match === speciesName && !card.matched
            );
            if (solutionIndex !== -1) {
              board[solutionIndex].matched = true;
              document.querySelector(`[data-index="${solutionIndex}"]`).classList.add("matched");
            }
          }
        } else {
          document.querySelector(`[data-index="${a.idx}"]`).classList.remove("flipped");
          document.querySelector(`[data-index="${b.idx}"]`).classList.remove("flipped");
        }
  
        flipped = [];
        socket.emit("updateBoard", board);
        socket.emit("changeTurn");
      }, 1000);
    }
  });
  
  

socket.on("revealCard", ({ index }) => {
  document.querySelector(`[data-index="${index}"]`).classList.add("flipped");
});

socket.on("turnChanged", ({ turn }) => {
  currentTurn = turn;
  document.getElementById("status").innerText = `Player ${turn}'s turn`;
  startTimer();
});

socket.on("syncBoard", (newBoard) => {
  board = newBoard;
  newBoard.forEach((card, i) => {
    const el = document.querySelector(`[data-index="${i}"]`);
    if (card.matched) {
      el.classList.add("flipped", "matched");
    } else if (!flipped.find(f => f.idx === i)) {
      el.classList.remove("flipped");
    }
  });
});

socket.on("scoreUpdate", (newScores) => {
  scores = newScores;
  updateScores();
});

socket.on("playerLeft", () => {
  alert("Other player left. Game over.");
  location.reload();
});
