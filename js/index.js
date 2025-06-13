// -----------------------------
// DOM Element References
// -----------------------------

// Game board and display elements
const board = document.getElementById("board");
const scoreBox = document.getElementById("scoreBox");
const hiscoreBox = document.getElementById("hiscoreBox");
const difficultyLabel = document.getElementById("difficultyLabel");

// Desktop controls
const startPauseBtn = document.getElementById("startPauseBtn");
const soundToggleBtn = document.getElementById("soundToggleBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const difficultySelector = document.getElementById("difficultySelector");

// Mobile controls
const startPauseBtnMobile = document.getElementById("startPauseBtnMobile");
const soundToggleBtnMobile = document.getElementById("soundToggleBtnMobile");
const themeToggleBtnMobile = document.getElementById("themeToggleBtnMobile");
const difficultySelectorMobile = document.getElementById(
  "difficultySelectorMobile"
);

// Mobile menu
const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileMenu = document.getElementById("mobileMenu");
const closeMenuBtn = document.getElementById("closeMenuBtn");

// Body element for theme toggling
const bodyEl = document.body;

// -----------------------------
// Audio Files
// -----------------------------

// Sound effects for various actions
const foodSound = new Audio("music/food.mp3");
const gameOverSound = new Audio("music/gameover.mp3");
const moveSound = new Audio("music/move.mp3");
const musicSound = new Audio("music/music.mp3");

// -----------------------------
// Game State Initialization
// -----------------------------

// Direction, speed, score, and frame timing
let inputDir = { x: 0, y: 0 },
  speed = 8,
  score = 0,
  lastPaintTime = 0;

// Snake body and initial food location
let snakeArr = [{ x: 9, y: 9 }],
  food = { x: 6, y: 7 };

// Game and sound control flags
let gameRunning = false,
  soundOn = true;

// Load saved difficulty or default to medium
let difficulty = localStorage.getItem("difficulty") || "medium";

// Load high scores per difficulty from local storage
let highScores = JSON.parse(localStorage.getItem("highScores")) || {
  easy: 0,
  medium: 0,
  hard: 0,
};

// Load theme or default to light
let savedTheme = localStorage.getItem("theme") || "light";

// -----------------------------
// Initial UI Setup
// -----------------------------

// Set initial UI states
difficultySelector.value = difficulty;
difficultySelectorMobile.value = difficulty;
setTheme(savedTheme);
updateSpeed();
updateScoreDisplay();

// -----------------------------
// Main Game Loop
// -----------------------------

function main(ctime) {
  if (!gameRunning) return;
  window.requestAnimationFrame(main);

  // Throttle frame rate based on speed
  if ((ctime - lastPaintTime) / 1000 < 1 / speed) return;

  lastPaintTime = ctime;
  gameEngine();
}

// -----------------------------
// Collision Detection
// -----------------------------

function isCollide(snake) {
  // Check self-collision
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
  }

  // Check wall collision (grid boundaries)
  if (
    snake[0].x <= 0 ||
    snake[0].x >= 18 ||
    snake[0].y <= 0 ||
    snake[0].y >= 18
  )
    return true;

  return false;
}

// -----------------------------
// Game Logic (Engine)
// -----------------------------

function gameEngine() {
  // Check for collisions
  if (isCollide(snakeArr)) {
    if (soundOn) gameOverSound.play();
    alert("Game Over! Press Start to play again.");
    resetGame();
    return;
  }

  // If food is eaten
  if (snakeArr[0].x === food.x && snakeArr[0].y === food.y) {
    if (soundOn) foodSound.play();
    score++;

    // Update high score if needed
    if (score > highScores[difficulty]) {
      highScores[difficulty] = score;
      localStorage.setItem("highScores", JSON.stringify(highScores));
    }
    updateScoreDisplay();

    // Add new head to grow snake
    snakeArr.unshift({
      x: snakeArr[0].x + inputDir.x,
      y: snakeArr[0].y + inputDir.y,
    });

    // Spawn new food at random location
    food = {
      x: Math.floor(2 + Math.random() * 15),
      y: Math.floor(2 + Math.random() * 15),
    };
  }

  // Move the snake body
  for (let i = snakeArr.length - 2; i >= 0; i--) {
    snakeArr[i + 1] = { ...snakeArr[i] };
  }

  // Move the snake head
  snakeArr[0].x += inputDir.x;
  snakeArr[0].y += inputDir.y;

  // Clear and redraw the game board
  board.innerHTML = "";

  // Draw snake
  snakeArr.forEach((seg, idx) => {
    const div = document.createElement("div");
    div.style.gridRowStart = seg.y;
    div.style.gridColumnStart = seg.x;
    div.classList.add(idx === 0 ? "head" : "snake");
    board.appendChild(div);
  });

  // Draw food
  const fEl = document.createElement("div");
  fEl.style.gridRowStart = food.y;
  fEl.style.gridColumnStart = food.x;
  fEl.classList.add("food");
  board.appendChild(fEl);
}

// -----------------------------
// Game Reset
// -----------------------------

function resetGame() {
  inputDir = { x: 0, y: 0 };
  snakeArr = [{ x: 9, y: 9 }];
  score = 0;
  updateScoreDisplay();
  gameRunning = false;
  startPauseBtn.textContent = "▶️ Start";
  startPauseBtnMobile.textContent = "▶️ Start";
  if (soundOn) musicSound.pause();
}

// -----------------------------
// UI Update Helpers
// -----------------------------

function updateScoreDisplay() {
  scoreBox.textContent = `Score: ${score}`;
  hiscoreBox.textContent = `High Score: ${highScores[difficulty]}`;
  difficultyLabel.textContent = `Difficulty: ${
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
  }`;
}

function updateSpeed() {
  if (difficulty === "easy") speed = 6;
  else if (difficulty === "medium") speed = 9;
  else speed = 13;
}

// -----------------------------
// Input Handling
// -----------------------------

window.addEventListener("keydown", (e) => {
  if (
    !gameRunning &&
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
  ) {
    e.preventDefault();
    return;
  }

  if (!gameRunning) return;

  if (soundOn) moveSound.play();

  // Change direction only if not reversing
  switch (e.key) {
    case "ArrowUp":
      if (inputDir.y !== 1) inputDir = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (inputDir.y !== -1) inputDir = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (inputDir.x !== 1) inputDir = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (inputDir.x !== -1) inputDir = { x: 1, y: 0 };
      break;
  }
});

// -----------------------------
// Control: Start / Pause Game
// -----------------------------

function toggleGame() {
  if (gameRunning) {
    gameRunning = false;
    startPauseBtn.textContent = "▶️ Start";
    startPauseBtnMobile.textContent = "▶️ Start";
    musicSound.pause();
  } else {
    if (inputDir.x === 0 && inputDir.y === 0) inputDir = { x: 0, y: 1 };
    gameRunning = true;
    startPauseBtn.textContent = "⏸ Pause";
    startPauseBtnMobile.textContent = "⏸ Pause";
    if (soundOn) musicSound.play();
    window.requestAnimationFrame(main);
  }
}
startPauseBtn.addEventListener("click", toggleGame);
startPauseBtnMobile.addEventListener("click", toggleGame);

// -----------------------------
// Control: Sound Toggle
// -----------------------------

function toggleSound() {
  soundOn = !soundOn;
  const txt = soundOn ? "🔊 Music On" : "🔇 Music Off";
  soundToggleBtn.textContent = txt;
  soundToggleBtnMobile.textContent = txt;
  if (soundOn && gameRunning) musicSound.play();
  else musicSound.pause();
}
soundToggleBtn.addEventListener("click", toggleSound);
soundToggleBtnMobile.addEventListener("click", toggleSound);

// -----------------------------
// Control: Theme Toggle
// -----------------------------

function toggleTheme() {
  const newTheme = bodyEl.classList.contains("dark") ? "light" : "dark";
  setTheme(newTheme);
}
themeToggleBtn.addEventListener("click", toggleTheme);
themeToggleBtnMobile.addEventListener("click", toggleTheme);

// -----------------------------
// Control: Difficulty Selector
// -----------------------------

function changeDifficulty(e) {
  difficulty = e.target.value;
  difficultySelector.value = difficultySelectorMobile.value = difficulty;
  localStorage.setItem("difficulty", difficulty);
  updateSpeed();
  resetGame();
}
difficultySelector.addEventListener("change", changeDifficulty);
difficultySelectorMobile.addEventListener("change", changeDifficulty);

// -----------------------------
// Mobile Menu Toggle
// -----------------------------

hamburgerBtn.addEventListener("click", () => {
  mobileMenu.classList.add("open");
});
closeMenuBtn.addEventListener("click", () => {
  mobileMenu.classList.remove("open");
});

// -----------------------------
// Theme Setup
// -----------------------------

function setTheme(theme) {
  bodyEl.classList.toggle("dark", theme === "dark");
  const txt = theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
  themeToggleBtn.textContent = txt;
  themeToggleBtnMobile.textContent = txt;
  localStorage.setItem("theme", theme);
}

// Mobile swipe detection
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

window.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
});

window.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;

  handleSwipeGesture();
});

function handleSwipeGesture() {
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal swipe
    if (dx > 30 && inputDir.x !== -1) inputDir = { x: 1, y: 0 }; // Right
    else if (dx < -30 && inputDir.x !== 1) inputDir = { x: -1, y: 0 }; // Left
  } else {
    // Vertical swipe
    if (dy > 30 && inputDir.y !== -1) inputDir = { x: 0, y: 1 }; // Down
    else if (dy < -30 && inputDir.y !== 1) inputDir = { x: 0, y: -1 }; // Up
  }

  if (soundOn && gameRunning) moveSound.play();
}
