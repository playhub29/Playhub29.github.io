const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const highEl = document.getElementById("high");

let board = Array(16).fill(0);
let score = 0;
let high = localStorage.getItem("2048-high") || 0;

highEl.textContent = high;

function start() {
  board = Array(16).fill(0);
  score = 0;
  addTile();
  addTile();
  draw();
}

function draw() {
  grid.innerHTML = "";
  board.forEach(val => {
    const tile = document.createElement("div");
    tile.className = "tile";
    if (val) {
      tile.textContent = val;
      tile.classList.add(`tile-${val}`);
    }
    grid.appendChild(tile);
  });
  scoreEl.textContent = score;
}

function addTile() {
  const empty = board
    .map((v, i) => v === 0 ? i : null)
    .filter(v => v !== null);

  if (!empty.length) return;
  const i = empty[Math.floor(Math.random() * empty.length)];
  board[i] = Math.random() > 0.9 ? 4 : 2;
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
      let idx =
        dir === "left" ? i * 4 + j :
        dir === "right" ? i * 4 + (3 - j) :
        dir === "up" ? j * 4 + i :
        (3 - j) * 4 + i;

      row.push(board[idx]);
    }

    let newRow = slide(row);
    while (newRow.length < 4) newRow.push(0);

    for (let j = 0; j < 4; j++) {
      let idx =
        dir === "left" ? i * 4 + j :
        dir === "right" ? i * 4 + (3 - j) :
        dir === "up" ? j * 4 + i :
        (3 - j) * 4 + i;

      if (board[idx] !== newRow[j]) {
        board[idx] = newRow[j];
        moved = true;
      }
    }
  }

  if (moved) {
    addTile();
    draw();
    if (score > high) {
      high = score;
      localStorage.setItem("2048-high", high);
      highEl.textContent = high;
    }
  }
}

function restart() {
  start();
}

function toggleFullscreen() {
  document.documentElement.requestFullscreen?.();
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") move("left");
  if (e.key === "ArrowRight") move("right");
  if (e.key === "ArrowUp") move("up");
  if (e.key === "ArrowDown") move("down");
});

start();
