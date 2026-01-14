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

highScoreEl.textContent = highScore;

function init() {
  board = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
  score = 0;
  hasWon = false;
  overlay.style.display = "none";
  addRandomTile();
  addRandomTile();
  render();
}

function addRandomTile() {
  const empty = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (board[r][c] === 0) empty.push({ r, c });
    }
  }
  if (!empty.length) return;
  const { r, c } = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function render() {
  grid.innerHTML = "";
  scoreEl.textContent = score;
  highScoreEl.textContent = highScore;

  board.forEach(row => {
    row.forEach(value => {
      const cell = document.createElement("div");
      cell.className = "cell";
      if (value) {
        cell.textContent = value;
        cell.classList.add(`tile-${value}`);
      }
      grid.appendChild(cell);
    });
  });
}

function slide(row) {
  row = row.filter(v => v);
  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] === row[i + 1]) {
      row[i] *= 2;
      score += row[i];
      if (row[i] === 2048) win();
      row[i + 1] = 0;
    }
  }
  return row.filter(v => v);
}

function moveLeft() {
  let moved = false;
  for (let r = 0; r < gridSize; r++) {
    const original = [...board[r]];
    const newRow = slide(board[r]);
    while (newRow.length < gridSize) newRow.push(0);
    board[r] = newRow;
    if (!arraysEqual(original, newRow)) moved = true;
  }
  return moved;
}

function moveRight() {
  board = board.map(row => row.reverse());
  const moved = moveLeft();
  board = board.map(row => row.reverse());
  return moved;
}

function moveUp() {
  transpose();
  const moved = moveLeft();
  transpose();
  return moved;
}

function moveDown() {
  transpose();
  const moved = moveRight();
  transpose();
  return moved;
}

function transpose() {
  board = board[0].map((_, i) => board.map(row => row[i]));
}

function arraysEqual(a, b) {
  return a.every((v, i) => v === b[i]);
}

function win() {
  hasWon = true;
  overlayText.textContent = "🎉 You Win!";
  overlay.style.display = "flex";
}

function lose() {
  overlayText.textContent = "Game Over";
  overlay.style.display = "flex";
}

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

document.addEventListener("keydown", e => {
  let moved = false;
  if (e.key === "ArrowLeft") moved = moveLeft();
  if (e.key === "ArrowRight") moved = moveRight();
  if (e.key === "ArrowUp") moved = moveUp();
  if (e.key === "ArrowDown") moved = moveDown();

  if (moved) {
    addRandomTile();
    if (!canMove()) lose();
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }
    render();
  }
});

/* MOBILE SWIPE */
let startX, startY;
document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

document.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - startX;
  const dy = e.changedTouches[0].clientY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 50) moveRight();
    else if (dx < -50) moveLeft();
  } else {
    if (dy > 50) moveDown();
    else if (dy < -50) moveUp();
  }

  addRandomTile();
  if (!canMove()) lose();
  render();
});

init();
