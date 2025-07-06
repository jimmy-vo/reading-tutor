import React, { useState, useEffect } from 'react';
import styles from './PassageChallenges.module.css';
import { Challenge } from '../models/view';

interface PassageChallengesProps {
  challenges: Challenge[];
  onChanged: (challenges: Challenge[]) => void;
}

const PassageChallenges: React.FC<PassageChallengesProps> = ({
  challenges: qnas,
  onChanged,
}) => {
  const [localChallenges, setChallenges] = useState(qnas);

  useEffect(() => {
    setChallenges(qnas);
  }, [qnas]);

  const handleAnswerChanged = (index: number, value: string) => {
    const updatedChallenges = [...localChallenges];
    updatedChallenges[index].answer = value;
    setChallenges(updatedChallenges);
    onChanged(updatedChallenges);
  };

  return (
    <div aria-hidden="true">
      {localChallenges.map((qna, index) => (
        <div key={qna.id}>
          <p className={styles.question}> {qna.question} </p>
          <input
            type="text"
            disabled={localChallenges[index].correct !== undefined}
            value={localChallenges[index].answer}
            onChange={(e) => handleAnswerChanged(index, e.target.value)}
            className={styles.input}
          />
          {localChallenges[index].correct !== undefined && (
            <span>
              {localChallenges[index].correct ? (
                <span style={{ color: 'green' }}>✔️</span>
              ) : (
                <span style={{ color: 'red' }}>❌</span>
              )}
            </span>
          )}
          <p className={styles.explaination}>
            {localChallenges[index].explaination}
          </p>
        </div>
      ))}
    </div>
  );
};

export default PassageChallenges;
