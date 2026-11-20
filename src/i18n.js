/**
 * i18n.js — Japanese / English UI translations
 */

export const translations = {
  en: {
    title: "Memory Game",
    subtitle: "Card Matching",
    difficulty: "Difficulty",
    theme: "Theme",
    moves: "Moves",
    time: "Time",
    best: "Best",
    bestMoves: "Best Moves",
    bestTime: "Best Time",
    noBest: "--",
    reset: "New Game",
    win: "You Win! 🎉",
    winMoves: "Completed in {moves} moves and {time}!",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    expert: "Expert",
    easyDesc: "4×3 · 12 cards",
    mediumDesc: "4×4 · 16 cards",
    hardDesc: "6×6 · 36 cards",
    expertDesc: "8×8 · 64 cards",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    language: "日本語",
  },
  ja: {
    title: "神経衰弱",
    subtitle: "カードマッチングゲーム",
    difficulty: "難易度",
    theme: "テーマ",
    moves: "手数",
    time: "時間",
    best: "ベスト",
    bestMoves: "最少手数",
    bestTime: "最速タイム",
    noBest: "--",
    reset: "新しいゲーム",
    win: "クリア！🎉",
    winMoves: "{moves} 手 · {time} でクリア！",
    easy: "かんたん",
    medium: "ふつう",
    hard: "むずかしい",
    expert: "エキスパート",
    easyDesc: "4×3 · 12枚",
    mediumDesc: "4×4 · 16枚",
    hardDesc: "6×6 · 36枚",
    expertDesc: "8×8 · 64枚",
    darkMode: "ダークモード",
    lightMode: "ライトモード",
    language: "English",
  },
};

export const DIFFICULTIES = {
  easy:   { cols: 4, rows: 3, pairs: 6  },
  medium: { cols: 4, rows: 4, pairs: 8  },
  hard:   { cols: 6, rows: 6, pairs: 18 },
  expert: { cols: 8, rows: 8, pairs: 32 },
};

/**
 * Get a translated string, interpolating {key} placeholders.
 * @param {string} lang  — "en" | "ja"
 * @param {string} key
 * @param {Object} [vars]
 * @returns {string}
 */
export function t(lang, key, vars = {}) {
  const str = translations[lang]?.[key] ?? translations.en[key] ?? key;
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}
