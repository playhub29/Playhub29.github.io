const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const highEl = document.getElementById("high");
const overlay = document.getElementById("overlay");

let grid, score;
let highScore = localStorage.getItem("2048-high") || 0;
highEl.textContent = highScore;

function startGame() {
  grid = Array(16).fill(0);
  score = 0;
  overlay.classList.remove("show");
  addTile();
  addTile();
  render();
}

function addTile() {
  const empty = grid
    .map((v, i) => v === 0 ? i : null)
    .filter(v => v !== null);

  if (!empty.length) return;
  const i = empty[Math.floor(Math.random() * empty.length)];
  grid[i] = Math.random() < 0.9 ? 2 : 4;
}

function render() {
  board.innerHTML = "";
  grid.forEach(v => {
    const cell = document.createElement("div");
    cell.className = "cell";
    if (v) {
      cell.textContent = v;
      cell.classList.add(`tile-${v}`);
    }
    board.appendChild(cell);
  });

  scoreEl.textContent = score;
  if (score > highScore) {
    highScore = score;
    highEl.textContent = highScore;
    localStorage.setItem("2048-high", highScore);
  }
}

function slide(row) {
  row = row.filter(v => v);
  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] === row[i + 1]) {
      row[i] *= 2;
      score += row[i];
      row[i + 1] = 0;
    }
  }
  return row.filter(v => v);
}

function move(dir) {
  let moved = false;

  for (let i = 0; i < 4; i++) {
    let row = [];
    for (let j = 0; j < 4; j++) {
      const idx =
        dir === "left" ? i * 4 + j :
        dir === "right" ? i * 4 + (3 - j) :
        dir === "up" ? j * 4 + i :
        (3 - j) * 4 + i;
      row.push(grid[idx]);
    }

    const newRow = slide(row);
    while (newRow.length < 4) newRow.push(0);

    for (let j = 0; j < 4; j++) {
      const idx =
        dir === "left" ? i * 4 + j :
        dir === "right" ? i * 4 + (3 - j) :
        dir === "up" ? j * 4 + i :
        (3 - j) * 4 + i;

      if (grid[idx] !== newRow[j]) {
        grid[idx] = newRow[j];
        moved = true;
      }
    }
  }

  if (moved) {
    addTile();
    render();
    if (isGameOver()) overlay.classList.add("show");
  }
}

function isGameOver() {
  if (grid.includes(0)) return false;
  for (let i = 0; i < 16; i++) {
    if (
      grid[i] === grid[i + 1] ||
      grid[i] === grid[i + 4]
    ) return false;
  }
  return true;
}

/* KEYBOARD */
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") move("left");
  if (e.key === "ArrowRight") move("right");
  if (e.key === "ArrowUp") move("up");
  if (e.key === "ArrowDown") move("down");
});

/* TOUCH SWIPE */
let startX, startY;
document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

document.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - startX;
  const dy = e.changedTouches[0].clientY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) move("right");
    if (dx < -30) move("left");
  } else {
    if (dy > 30) move("down");
    if (dy < -30) move("up");
  }
});

startGame();
