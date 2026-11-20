/**
 * main.js — DOM wiring, event handling, rendering, localStorage best scores.
 */

import { createGame, flipCard, checkMatch, isWin, getElapsed, THEMES } from "./memory.js";
import { t, DIFFICULTIES, translations } from "./i18n.js";

// ─── State ───────────────────────────────────────────────────────────────────

let state = null;
let lang = localStorage.getItem("mg-lang") || "en";
let difficulty = localStorage.getItem("mg-difficulty") || "medium";
let theme = localStorage.getItem("mg-theme") || "emoji";
let darkMode = localStorage.getItem("mg-dark") === "true";
let timerInterval = null;
let isChecking = false; // lock during check-match delay

// ─── DOM refs ─────────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);
const grid        = $("grid");
const movesEl     = $("moves");
const timeEl      = $("time");
const bestMovesEl = $("best-moves");
const bestTimeEl  = $("best-time");
const resetBtn    = $("reset-btn");
const diffSelect  = $("diff-select");
const themeSelect = $("theme-select");
const darkBtn     = $("dark-btn");
const langBtn     = $("lang-btn");
const winOverlay  = $("win-overlay");
const winMsg      = $("win-msg");
const winPlayAgain = $("win-play-again");

// ─── LocalStorage helpers ─────────────────────────────────────────────────────

function bestKey(diff, th) { return `mg-best-${diff}-${th}`; }

function getBest(diff, th) {
  const raw = localStorage.getItem(bestKey(diff, th));
  return raw ? JSON.parse(raw) : null;
}

function saveBest(diff, th, moves, elapsed) {
  const prev = getBest(diff, th);
  if (!prev || moves < prev.moves || (moves === prev.moves && elapsed < prev.elapsed)) {
    localStorage.setItem(bestKey(diff, th), JSON.stringify({ moves, elapsed }));
    return true;
  }
  return false;
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// ─── Timer ────────────────────────────────────────────────────────────────────

function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    if (state?.startedAt) {
      timeEl.textContent = formatTime(getElapsed(state, Date.now()));
    }
  }, 500);
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

// ─── Rendering ────────────────────────────────────────────────────────────────

function renderBest() {
  const best = getBest(difficulty, theme);
  if (best) {
    bestMovesEl.textContent = best.moves;
    bestTimeEl.textContent = formatTime(best.elapsed);
  } else {
    bestMovesEl.textContent = t(lang, "noBest");
    bestTimeEl.textContent = t(lang, "noBest");
  }
}

function renderUI() {
  // Translate all data-i18n elements
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(lang, el.dataset.i18n);
  });
  // Difficulty descriptions
  document.querySelectorAll("[data-i18n-diff]").forEach(el => {
    el.textContent = t(lang, el.dataset.i18nDiff);
  });
  darkBtn.textContent = darkMode ? t(lang, "lightMode") : t(lang, "darkMode");
  langBtn.textContent = t(lang, "language");
  renderBest();
}

function renderCard(card) {
  const cardEl = document.createElement("div");
  cardEl.className = "card" +
    (card.flipped || card.matched ? " flipped" : "") +
    (card.matched ? " matched" : "");
  cardEl.dataset.id = card.id;
  cardEl.setAttribute("role", "button");
  cardEl.setAttribute("tabindex", "0");
  cardEl.setAttribute("aria-pressed", String(card.flipped || card.matched));

  const inner = document.createElement("div");
  inner.className = "card-inner";

  const front = document.createElement("div");
  front.className = "card-front";
  front.setAttribute("aria-hidden", "true");

  const back = document.createElement("div");
  back.className = "card-back";

  // Render value
  if (theme === "shapes") {
    const [shape, color] = card.value.split("-");
    const svg = shapeToSVG(shape, color);
    back.innerHTML = svg;
  } else {
    back.textContent = card.value;
  }

  inner.appendChild(front);
  inner.appendChild(back);
  cardEl.appendChild(inner);

  cardEl.addEventListener("click", () => handleCardClick(card.id));
  cardEl.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(card.id);
    }
  });

  return cardEl;
}

function shapeToSVG(shape, color) {
  const colors = {
    red: "#e74c3c", blue: "#3498db", green: "#2ecc71", yellow: "#f1c40f",
    purple: "#9b59b6", orange: "#e67e22", pink: "#fd79a8", teal: "#1abc9c",
  };
  const c = colors[color] || "#888";
  const size = 48;
  if (shape === "circle") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="${c}"/></svg>`;
  } else if (shape === "square") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill="${c}"/></svg>`;
  } else if (shape === "triangle") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48"><polygon points="24,4 44,44 4,44" fill="${c}"/></svg>`;
  } else if (shape === "diamond") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48"><polygon points="24,2 46,24 24,46 2,24" fill="${c}"/></svg>`;
  }
  return "";
}

function renderGrid() {
  grid.innerHTML = "";
  const { cols } = DIFFICULTIES[difficulty];
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  state.cards.forEach(card => {
    grid.appendChild(renderCard(card));
  });
}

function updateStats() {
  movesEl.textContent = state.moves;
  timeEl.textContent = state.startedAt ? formatTime(getElapsed(state, Date.now())) : "00:00";
}

// ─── Game logic ───────────────────────────────────────────────────────────────

function newGame() {
  stopTimer();
  isChecking = false;
  winOverlay.hidden = true;
  const { pairs } = DIFFICULTIES[difficulty];
  state = createGame(pairs, theme);
  renderGrid();
  updateStats();
  renderBest();
  startTimer();
}

function handleCardClick(cardId) {
  if (isChecking) return;
  if (!state) return;

  const card = state.cards.find(c => c.id === cardId);
  if (!card || card.matched || card.flipped) return;

  const flippedBefore = state.cards.filter(c => c.flipped && !c.matched).length;

  state = flipCard(state, cardId);
  renderGrid();
  updateStats();

  const flippedAfter = state.cards.filter(c => c.flipped && !c.matched).length;

  if (flippedBefore === 1 && flippedAfter === 2) {
    // Two cards flipped — check after delay
    isChecking = true;
    setTimeout(() => {
      state = checkMatch(state);
      renderGrid();
      updateStats();
      isChecking = false;

      if (isWin(state)) {
        stopTimer();
        const elapsed = getElapsed(state, Date.now());
        saveBest(difficulty, theme, state.moves, elapsed);
        renderBest();
        showWin(state.moves, elapsed);
      }
    }, 800);
  }
}

function showWin(moves, elapsed) {
  winMsg.textContent = t(lang, "winMoves", { moves, time: formatTime(elapsed) });
  winOverlay.hidden = false;
  launchConfetti();
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function launchConfetti() {
  const canvas = $("confetti-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = "block";

  const pieces = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    w: 8 + Math.random() * 8,
    h: 4 + Math.random() * 4,
    color: `hsl(${Math.random() * 360},80%,60%)`,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.2,
    vx: (Math.random() - 0.5) * 3,
    vy: 2 + Math.random() * 3,
  }));

  let frame = 0;
  const MAX = 200;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.spin;
      if (p.y > canvas.height) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
    });
    frame++;
    if (frame < MAX) {
      requestAnimationFrame(draw);
    } else {
      canvas.style.display = "none";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  draw();
}

// ─── Controls ────────────────────────────────────────────────────────────────

resetBtn.addEventListener("click", newGame);
winPlayAgain.addEventListener("click", newGame);

diffSelect.addEventListener("change", e => {
  difficulty = e.target.value;
  localStorage.setItem("mg-difficulty", difficulty);
  renderBest();
  newGame();
});

themeSelect.addEventListener("change", e => {
  theme = e.target.value;
  localStorage.setItem("mg-theme", theme);
  renderBest();
  newGame();
});

darkBtn.addEventListener("click", () => {
  darkMode = !darkMode;
  localStorage.setItem("mg-dark", darkMode);
  document.documentElement.classList.toggle("dark", darkMode);
  darkBtn.textContent = darkMode ? t(lang, "lightMode") : t(lang, "darkMode");
});

langBtn.addEventListener("click", () => {
  lang = lang === "en" ? "ja" : "en";
  localStorage.setItem("mg-lang", lang);
  renderUI();
  // Update win overlay if visible
  if (!winOverlay.hidden && state) {
    winMsg.textContent = t(lang, "winMoves", {
      moves: state.moves,
      time: formatTime(getElapsed(state, Date.now())),
    });
  }
});

// ─── Init ─────────────────────────────────────────────────────────────────────

// Populate theme select
Object.entries(THEMES).forEach(([key, th]) => {
  const opt = document.createElement("option");
  opt.value = key;
  opt.textContent = th.label.en + " / " + th.label.ja;
  opt.selected = key === theme;
  themeSelect.appendChild(opt);
});

// Set initial dark mode
if (darkMode) document.documentElement.classList.add("dark");

// Set initial selects
diffSelect.value = difficulty;

renderUI();
newGame();
