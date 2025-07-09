const board = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const difficultySelect = document.getElementById('difficulty');
const winMessage = document.getElementById('win-message');
const finalScore = document.getElementById('final-score');
const leaderboardList = document.getElementById('leaderboard-list');
const message = document.getElementById('message');

let cards = [];
let flipped = [];
let matchedCount = 0;
let timer = 0;
let moves = 0;
let interval;
let totalPairs;

const emojiSets = {
  easy: ['cat.png', 'dog.png', 'car.png', 'smile.png'],
  medium: ['cat.png','dog.png','car.png','plane.png','smile.png','hat.png','star.png','heart.png'],
  hard: ['cat.png','dog.png','car.png','plane.png','smile.png','hat.png','star.png','heart.png','book.png','cup.png','house.png','light.png','moon.png','sun.png','phone.png','tv.png','key.png','globe.png']
};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startTimer() {
  clearInterval(interval);
  timer = 0;
  timerDisplay.textContent = "Time: 0s";
  interval = setInterval(() => {
    timer++;
    timerDisplay.textContent = `Time: ${timer}s`;
  }, 1000);
}

function createBoard(difficulty = "medium") {
  board.innerHTML = "";
  winMessage.classList.add("hidden");

  const images = emojiSets[difficulty];
  totalPairs = images.length;
  const pairCards = shuffle([...images, ...images]);

  const cols = difficulty === "easy" ? 4 : difficulty === "medium" ? 4 : 6;
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  pairCards.forEach((img, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.value = img;
    card.dataset.index = index;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"><img src="assets/images/${img}" alt="icon" /></div>
        <div class="card-back"></div>
      </div>
    `;

    card.addEventListener("click", () => flipCard(card));
    board.appendChild(card);
  });

  cards = Array.from(document.querySelectorAll(".card"));
  flipped = [];
  matchedCount = 0;
  moves = 0;
  updateStats();
  startTimer();
}

function flipCard(card) {
  if (
    card.classList.contains("flipped") ||
    card.classList.contains("matched") ||
    flipped.length === 2
  ) return;

  card.classList.add("flipped");
  flipped.push(card);

  if (flipped.length === 2) {
    moves++;
    updateStats();

    const [first, second] = flipped;
    if (first.dataset.value === second.dataset.value) {
      flipped.forEach(c => c.classList.add("matched"));
      matchedCount++;
      flipped = [];
      if (matchedCount === totalPairs) endGame();
    } else {
      setTimeout(() => {
        flipped.forEach(c => c.classList.remove("flipped"));
        flipped = [];
      }, 800);
    }
  }
}

function endGame() {
  clearInterval(interval);
  const final = Math.max(1000 - (moves * 10 + timer * 2), 0);
  finalScore.textContent = `🎯 Final Score: ${final} | Time: ${timer}s | Moves: ${moves}`;
  winMessage.classList.remove("hidden");
  saveToLeaderboard(final, timer, moves);
}


function updateStats() {
  scoreDisplay.textContent = `Score: ${Math.max(1000 - (moves * 10 + timer * 2), 0)}`;
  movesDisplay.textContent = `Moves: ${moves}`;
}

function restartGame() {
  createBoard(difficultySelect.value);
}

difficultySelect.addEventListener("change", restartGame);
createBoard("medium");
displayLeaderboard();
 

function saveToLeaderboard(score, time, moves) {
  const entry = {
    score,
    time,
    moves,
    date: new Date().toLocaleString()
  };

  const stored = JSON.parse(localStorage.getItem("leaderboard")) || [];
  stored.push(entry);
  stored.sort((a, b) => b.score - a.score); // highest score first
  const top5 = stored.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(top5));
  displayLeaderboard();
}

function displayLeaderboard() {
  const list = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboardList.innerHTML = "";

  list.forEach((entry, i) => {
    const li = document.createElement("li");
    li.textContent = `#${i + 1} - ${entry.score} pts | ${entry.time}s | ${entry.moves} moves`;
    leaderboardList.appendChild(li);
  });
}

