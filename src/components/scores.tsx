import React from 'react';
import styles from './scores.module.css';

interface ScoresProps {
  className?: string;
  onResetTap: () => void;
  scores: { correct: number; total: number };
}

const Scores: React.FC<ScoresProps> = ({ onResetTap, scores, className }) => {
  return (
    <div className={className}>
      <div className={styles.container}>
        <span className={styles.scores}>
          Correct Answers: {scores.correct}/{scores.total}
        </span>
        <button className={styles.button} onClick={onResetTap}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default Scores;
