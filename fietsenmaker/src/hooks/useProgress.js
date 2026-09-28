import { useState } from "react";
import { ACHIEVEMENTS } from "../data/achievements";

const STORAGE_KEY = "fietsenmaker_progress";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function defaultProgress() {
  return {
    games: {
      woorden: { totalStars: 0, sessions: [], bestScore: 0 },
      rekenen: { totalStars: 0, sessions: [], bestScore: 0 },
      letters: { totalStars: 0, sessions: [], bestScore: 0 },
    },
    unlockedAchievements: [],
    lastPlayed: null,
    streak: 0,
    totalSessions: 0,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const saved = JSON.parse(raw);
    // Merge so new games keys always exist
    const def = defaultProgress();
    return {
      ...def,
      ...saved,
      games: { ...def.games, ...saved.games },
    };
  } catch {
    return defaultProgress();
  }
}

function persistSave(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {}
}

function computeStreak(prev, today) {
  if (!prev.lastPlayed) return 1;
  if (prev.lastPlayed === today) return prev.streak; // already played today
  const last = new Date(prev.lastPlayed);
  const now = new Date(today);
  const diffDays = Math.round((now - last) / 86_400_000);
  return diffDays === 1 ? prev.streak + 1 : 1;
}

function getTotalStars(progress) {
  return Object.values(progress.games).reduce((sum, g) => sum + g.totalStars, 0);
}

export function useProgress() {
  const [progress, setProgress] = useState(load);

  /**
   * Call after a game finishes.
   * Returns array of newly unlocked ACHIEVEMENTS objects (may be empty).
   */
  const addGameScore = (gameId, score) => {
    const today = todayStr();

    setProgress((prev) => {
      const game = prev.games[gameId] ?? { totalStars: 0, sessions: [], bestScore: 0 };
      const newProgress = {
        ...prev,
        games: {
          ...prev.games,
          [gameId]: {
            totalStars: game.totalStars + score,
            sessions: [...game.sessions, { date: today, score }],
            bestScore: Math.max(game.bestScore, score),
          },
        },
        lastPlayed: today,
        streak: computeStreak(prev, today),
        totalSessions: prev.totalSessions + 1,
      };

      const newlyUnlocked = ACHIEVEMENTS.filter(
        (a) => !prev.unlockedAchievements.includes(a.id) && a.check(newProgress)
      );
      newProgress.unlockedAchievements = [
        ...prev.unlockedAchievements,
        ...newlyUnlocked.map((a) => a.id),
      ];

      persistSave(newProgress);
      return newProgress;
    });

    // Re-check synchronously to return newly unlocked achievements to caller.
    // We load fresh from storage after the state update — simpler: just compute here too.
    const prev = progress;
    const game = prev.games[gameId] ?? { totalStars: 0, sessions: [], bestScore: 0 };
    const newProgress = {
      ...prev,
      games: {
        ...prev.games,
        [gameId]: {
          totalStars: game.totalStars + score,
          sessions: [...game.sessions, { date: today, score }],
          bestScore: Math.max(game.bestScore, score),
        },
      },
      lastPlayed: today,
      streak: computeStreak(prev, today),
      totalSessions: prev.totalSessions + 1,
    };

    return ACHIEVEMENTS.filter(
      (a) => !prev.unlockedAchievements.includes(a.id) && a.check(newProgress)
    );
  };

  const totalStars = getTotalStars(progress);
  const todayPlayed = progress.lastPlayed === todayStr();

  return { progress, addGameScore, totalStars, todayPlayed };
}
