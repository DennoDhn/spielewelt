/**
 * memory.js — Pure game logic for the Memory Card Matching Game
 * No DOM, no side effects, fully immutable state transitions.
 */

export const THEMES = {
  emoji: {
    label: { en: "Emoji", ja: "絵文字" },
    values: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮",
             "🐷","🐸","🐙","🐡","🦋","🐝","🌸","🌈","⭐","🍎","🍓","🎸",
             "🎯","🏆","🚀","🌙","💎","🔥","🌺","🦄"],
  },
  numbers: {
    label: { en: "Numbers", ja: "数字" },
    values: Array.from({ length: 32 }, (_, i) => String(i + 1)),
  },
  alphabet: {
    label: { en: "Alphabet", ja: "アルファベット" },
    values: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").concat(
      ["Α","Β","Γ","Δ","Ε","Ζ"] // Greek to fill up to 32
    ),
  },
  shapes: {
    label: { en: "Shapes", ja: "図形" },
    values: [
      "circle-red","circle-blue","circle-green","circle-yellow",
      "circle-purple","circle-orange","circle-pink","circle-teal",
      "square-red","square-blue","square-green","square-yellow",
      "square-purple","square-orange","square-pink","square-teal",
      "triangle-red","triangle-blue","triangle-green","triangle-yellow",
      "triangle-purple","triangle-orange","triangle-pink","triangle-teal",
      "diamond-red","diamond-blue","diamond-green","diamond-yellow",
      "diamond-purple","diamond-orange","diamond-pink","diamond-teal",
    ],
  },
  hiragana: {
    label: { en: "Hiragana", ja: "ひらがな" },
    values: "あいうえおかきくけこさしすせそたちつてとなにぬねの".split("").concat(
      "はひふへほまみむめもやゆよ".split("")
    ),
  },
};

/**
 * Fisher-Yates shuffle — returns a new shuffled array, input is unchanged.
 * @param {Array} array
 * @returns {Array}
 */
export function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Return `count` values for the given theme (cycling if needed).
 * @param {string} theme
 * @param {number} count   — number of unique values (= pair count)
 * @returns {string[]}
 */
export function getThemeValues(theme, count) {
  const pool = THEMES[theme]?.values;
  if (!pool) throw new Error(`Unknown theme: ${theme}`);
  if (count > pool.length) throw new Error(`Theme "${theme}" has only ${pool.length} values, need ${count}`);
  return pool.slice(0, count);
}

/**
 * Create a fresh game state.
 * @param {number} pairCount   — number of pairs (half the cards)
 * @param {string} theme       — one of THEMES keys
 * @returns {GameState}
 */
export function createGame(pairCount, theme = "emoji") {
  const values = getThemeValues(theme, pairCount);
  // Each value appears exactly twice
  const doubled = [...values, ...values];
  const shuffled = shuffle(doubled);
  const cards = shuffled.map((value, index) => ({
    id: index,
    value,
    flipped: false,
    matched: false,
  }));
  return {
    cards,
    firstCard: null,   // id of first flipped card (waiting for second)
    moves: 0,
    matches: 0,
    started: false,
    startedAt: null,
    theme,
    pairCount,
  };
}

/**
 * Flip a card. Returns a new state.
 * - Ignores flip if: card already matched, card already flipped (= firstCard), or two cards are pending check.
 * - Sets `started = true` and `startedAt` on first flip.
 * @param {GameState} state
 * @param {number} cardId
 * @param {number} [now]   — Date.now() for timer; defaults to Date.now()
 * @returns {GameState}
 */
export function flipCard(state, cardId, now = Date.now()) {
  const card = state.cards.find(c => c.id === cardId);
  if (!card) return state;
  if (card.matched || card.flipped) return state;

  // Count currently flipped-and-unmatched cards
  const flippedUnmatched = state.cards.filter(c => c.flipped && !c.matched);
  if (flippedUnmatched.length >= 2) return state; // waiting for checkMatch

  const newCards = state.cards.map(c =>
    c.id === cardId ? { ...c, flipped: true } : c
  );

  const started = true;
  const startedAt = state.startedAt ?? now;

  if (state.firstCard === null) {
    // First card of a pair
    return { ...state, cards: newCards, firstCard: cardId, started, startedAt };
  } else {
    // Second card — caller must invoke checkMatch after a delay
    return { ...state, cards: newCards, started, startedAt };
  }
}

/**
 * Check whether the two currently flipped (unmatched) cards form a match.
 * Call this after a short delay following the second flip.
 * @param {GameState} state
 * @returns {GameState}
 */
export function checkMatch(state) {
  const flipped = state.cards.filter(c => c.flipped && !c.matched);
  if (flipped.length !== 2) return state;

  const [a, b] = flipped;
  const isMatch = a.value === b.value;

  const newCards = state.cards.map(c => {
    if (c.id === a.id || c.id === b.id) {
      return isMatch
        ? { ...c, matched: true }
        : { ...c, flipped: false };
    }
    return c;
  });

  return {
    ...state,
    cards: newCards,
    firstCard: null,
    moves: state.moves + 1,
    matches: isMatch ? state.matches + 1 : state.matches,
  };
}

/**
 * Returns true when all pairs are matched.
 * @param {GameState} state
 * @returns {boolean}
 */
export function isWin(state) {
  return state.matches === state.pairCount;
}

/**
 * Returns elapsed time in milliseconds since the game started.
 * @param {GameState} state
 * @param {number} now   — current timestamp (Date.now())
 * @returns {number}
 */
export function getElapsed(state, now) {
  if (!state.startedAt) return 0;
  return now - state.startedAt;
}
