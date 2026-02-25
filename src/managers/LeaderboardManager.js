const STORAGE_KEY = 'arcane_defenders_leaderboard';
const MAX_ENTRIES = 20;

export default class LeaderboardManager {
  constructor() {
    this.entries = this.load();
  }

  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to load leaderboard:', e);
      return [];
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch (e) {
      console.warn('Failed to save leaderboard:', e);
    }
  }

  submitScore(playerName, score, level, wavesCompleted) {
    const entry = {
      name: playerName,
      score,
      level,
      wavesCompleted,
      date: Date.now(),
    };

    this.entries.push(entry);
    this.entries.sort((a, b) => b.score - a.score);
    this.entries = this.entries.slice(0, MAX_ENTRIES);
    this.save();

    // Return the rank (1-indexed), or null if score was too low
    const idx = this.entries.findIndex(e => e === entry);
    return idx >= 0 ? idx + 1 : null;
  }

  getTopScores(count = 10) {
    return this.entries.slice(0, count);
  }

  getScoresForLevel(level, count = 10) {
    return this.entries
      .filter(e => e.level === level)
      .slice(0, count);
  }

  getHighScore() {
    return this.entries.length > 0 ? this.entries[0].score : 0;
  }

  isHighScore(score) {
    if (this.entries.length < MAX_ENTRIES) return true;
    return score > this.entries[this.entries.length - 1].score;
  }

  clearAll() {
    this.entries = [];
    this.save();
  }
}
