const size = 4;
let board = [];
let score = 0;

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const overlay = document.getElementById("game-over");

function init() {
  board = Array.from({ length: size }, () => Array(size).fill(0));
  score = 0;
  scoreEl.textContent = score;
  overlay.style.display = "none";
  boardEl.innerHTML = "";

  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    boardEl.appendChild(cell);
  }

  addTile();
  addTile();
  render();
}

function addTile() {
  const empty = [];
  board.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v === 0) empty.push({ r, c });
    })
  );

  if (!empty.length) return;
  const { r, c } = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function render(merged = []) {
  const cells = document.querySelectorAll(".cell");

  board.flat().forEach((value, i) => {
    const cell = cells[i];
    cell.textContent = value || "";
    cell.className = "cell";
    if (value) cell.classList.add(`tile-${value}`);

    if (merged.includes(i)) {
      cell.classList.add("merged");
      setTimeout(() => cell.classList.remove("merged"), 150);
    }
  });
}

function slide(row) {
  let arr = row.filter(v => v);
  let mergedIndexes = [];

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      scoreEl.textContent = score;
      arr[i + 1] = 0;
      mergedIndexes.push(i);
    }
  }

  arr = arr.filter(v => v);
  while (arr.length < size) arr.push(0);

  return { row: arr, mergedIndexes };
}

function move(dir) {
  let moved = false;
  let mergedCells = [];

  const rotate = dir === "up" || dir === "down";
  const reverse = dir === "right" || dir === "down";

  let temp = rotate
    ? board[0].map((_, i) => board.map(r => r[i]))
    : board.map(r => [...r]);

  temp.forEach((row, r) => {
    if (reverse) row.reverse();
    const { row: newRow, mergedIndexes } = slide(row);
    if (reverse) newRow.reverse();

    if (JSON.stringify(row) !== JSON.stringify(newRow)) moved = true;
    temp[r] = newRow;

    mergedIndexes.forEach(i => {
      const index = rotate
        ? i * size + r
        : r * size + i;
      mergedCells.push(index);
    });
  });

  board = rotate
    ? temp[0].map((_, i) => temp.map(r => r[i]))
    : temp;

  if (moved) {
    addTile();
    render(mergedCells);
    if (isGameOver()) overlay.style.display = "flex";
  }
}

function isGameOver() {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 0) return false;
      if (c < size - 1 && board[r][c] === board[r][c + 1]) return false;
      if (r < size - 1 && board[r][c] === board[r + 1][c]) return false;
    }
  }
  return true;
}

/* ===== CONTROLS ===== */
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") move("left");
  if (e.key === "ArrowRight") move("right");
  if (e.key === "ArrowUp") move("up");
  if (e.key === "ArrowDown") move("down");
});

/* Mobile swipe */
let startX = 0, startY = 0;
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

init();
