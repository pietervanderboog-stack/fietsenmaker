import { useState } from "react";
import { playSound } from "../data/sounds";

/**
 * Shared game-loop state machine for multiple-choice games.
 * Manages round, score, feedback, confetti, and done state.
 *
 * Usage:
 *   const { round, score, fb, conf, ans, done, handleAnswer } = useGameRounds({
 *     total: 8,
 *     onDone: (finalScore) => onScore(finalScore),
 *     delay: 1600,
 *   });
 *
 *   // In your answer handler:
 *   handleAnswer(isCorrect, isCorrect ? pick(CHEERS) : `Het was: ${cur.woord}`);
 */
export function useGameRounds({ total, onDone, delay = 1600 }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState(null);
  const [conf, setConf] = useState(false);
  const [ans, setAns] = useState(false);
  const [done, setDone] = useState(false);

  const handleAnswer = (isCorrect, feedbackText) => {
    if (ans) return;
    setAns(true);

    const newScore = score + (isCorrect ? 1 : 0);

    if (isCorrect) {
      playSound("correct");
      setScore(newScore);
      setConf(true);
      setTimeout(() => setConf(false), 1500);
    } else {
      playSound("wrong");
    }

    setFb({ ok: isCorrect, t: feedbackText });

    setTimeout(() => {
      if (round + 1 >= total) {
        setDone(true);
        onDone(newScore);
        playSound("win");
      } else {
        setRound((r) => r + 1);
        setFb(null);
        setAns(false);
      }
    }, delay);
  };

  return { round, score, fb, conf, ans, done, handleAnswer };
}
