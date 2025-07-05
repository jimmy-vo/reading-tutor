import React, { useState, useEffect } from 'react';
import styles from './scores.module.css';
import { ContentSet } from '../models/view';
import { getShowResetFromStorage } from '../services/config-service';

interface ScoresProps {
  className?: string;
  onResetTap: () => void;
  reports: ContentSet[];
}

const Scores: React.FC<ScoresProps> = ({ onResetTap, reports, className }) => {
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    setShowReset(getShowResetFromStorage());
  }, []);

  const answerResults = reports
    .map((x) => x.challenges)
    .flat()
    .map((x) => x.correct);
  const correct = answerResults.filter((x) => x).length;
  const total = answerResults.length;
  return (
    <div className={className}>
      <span className={`${styles.scores} ${!showReset ? styles.center : ''}`}>
        Total Score: {correct}/{total}
      </span>
      {showReset && (
        <button className={styles.button} onClick={onResetTap}>
          Reset
        </button>
      )}
    </div>
  );
};

export default Scores;
