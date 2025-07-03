import React from 'react';
import styles from './scores.module.css';
import { ContentSet } from '../models/view';

interface ScoresProps {
  className?: string;
  onResetTap: () => void;
  reports: ContentSet[];
}

const Scores: React.FC<ScoresProps> = ({ onResetTap, reports, className }) => {
  const answerResults = reports
    .map((x) => x.challenges)
    .flat()
    .map((x) => x.correct);
  const correct = answerResults.filter((x) => x).length;
  const total = answerResults.length;
  return (
    <div className={className}>
      <div className={styles.container}>
        <span className={styles.scores}>
          Correct Answers: {correct}/{total}
        </span>
        <button className={styles.button} onClick={onResetTap}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default Scores;
