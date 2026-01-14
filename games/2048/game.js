const gridSize = 4;
let board = [];
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let hasWon = false;

const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");
const overlayBtn = document.getElementById("overlayBtn");

highScoreEl.textContent = highScore;

/* ===== INIT ===== */
function init() {
  board = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(0)
  );
  score = 0;
  hasWon = false;
  overlay.style.display = "none";
  addRandomTile();
  addRandomTile();
  render();
}

/* ===== RENDER ===== */
function render() {
  grid.innerHTML = "";
  scoreEl.textContent = score;
  highScoreEl.textContent = highScore;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      if (board[r][c] !== 0) {
        cell.textContent = board[r][c];
        cell.classList.add(`tile-${board[r][c]}`);
      }

      grid.appendChild(cell);
    }
  }
}

/* ===== RANDOM TILE ===== */
function addRandomTile() {
  const empty = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (board[r][c] === 0) empty.push([r, c]);
    }
  }
  if (!empty.length) return;

  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

/* ===== SLIDE ===== */
function slide(row) {
  row = row.filter(v => v !== 0);
  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] === row[i + 1]) {
      row[i] *= 2;
      score += row[i];

      if (row[i] === 2048 && !hasWon) win();

      highScore = Math.max(highScore, score);
      localStorage.setItem("highScore", highScore);

      row[i + 1] = 0;
    }
  }
  row = row.filter(v => v !== 0);
  while (row.length < gridSize) row.push(0);
  return row;
}

/* ===== MOVES ===== */
function moveLeft() {
  let moved = false;
  for (let r = 0; r < gridSize; r++) {
    const original = [...board[r]];
    board[r] = slide(board[r]);
    if (!arraysEqual(original, board[r])) moved = true;
  }
  return moved;
}

function moveRight() {
  let moved = false;
  for (let r = 0; r < gridSize; r++) {
    const original = [...board[r]];
    board[r] = slide(board[r].reverse()).reverse();
    if (!arraysEqual(original, board[r])) moved = true;
  }
  return moved;
}

function moveUp() {
  let moved = false;
  for (let c = 0; c < gridSize; c++) {
    let col = board.map(r => r[c]);
    const original = [...col];
    col = slide(col);
    for (let r = 0; r < gridSize; r++) board[r][c] = col[r];
    if (!arraysEqual(original, col)) moved = true;
  }
  return moved;
}

function moveDown() {
  let moved = false;
  for (let c = 0; c < gridSize; c++) {
    let col = board.map(r => r[c]);
    const original = [...col];
    col = slide(col.reverse()).reverse();
    for (let r = 0; r < gridSize; r++) board[r][c] = col[r];
    if (!arraysEqual(original, col)) moved = true;
  }
  return moved;
}

/* ===== GAME STATES ===== */
function canMove() {
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (board[r][c] === 0) return true;
      if (c < 3 && board[r][c] === board[r][c + 1]) return true;
      if (r < 3 && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

function lose() {
  overlayText.textContent = "Game Over";
  overlayBtn.textContent = "Restart";
  overlay.style.display = "flex";
}

function win() {
  hasWon = true;
  overlayText.textContent = "You Win!";
  overlayBtn.textContent = "Keep Playing";
  overlay.style.display = "flex";
}

overlayBtn.onclick = () => {
  overlay.style.display = "none";
};

/* ===== INPUT ===== */
document.addEventListener("keydown", e => {
  let moved = false;
  if (e.key === "ArrowLeft") moved = moveLeft();
  if (e.key === "ArrowRight") moved = moveRight();
  if (e.key === "ArrowUp") moved = moveUp();
  if (e.key === "ArrowDown") moved = moveDown();

  if (moved) {
    addRandomTile();
    if (!canMove()) lose();
    render();
  }
});

/* ===== TOUCH ===== */
let startX, startY;

document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

document.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - startX;
  const dy = e.changedTouches[0].clientY - startY;
  let moved = false;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 50) moved = moveRight();
    else if (dx < -50) moved = moveLeft();
  } else {
    if (dy > 50) moved = moveDown();
    else if (dy < -50) moved = moveUp();
  }

  if (moved) {
    addRandomTile();
    if (!canMove()) lose();
    render();
  }
});

/* ===== UTIL ===== */
function arraysEqual(a, b) {
  return a.every((v, i) => v === b[i]);
}

/* START */
init();
