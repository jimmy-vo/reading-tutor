import React, { useState, useEffect } from 'react';
import styles from './PassageChallenges.module.css';
import Spinner from './Spinner';
import { Challenge } from '../models/view';

interface PassageChallengesProps {
  challenges: Challenge[];
  onChanged: (challenges: Challenge[]) => void;
  isSubmitting: boolean;
}

const PassageChallenges: React.FC<PassageChallengesProps> = ({
  challenges: qnas,
  onChanged,
  isSubmitting,
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
    <div aria-hidden="true" className={styles.container}>
      {localChallenges.map((qna, index) => (
        <div key={qna.id}>
          <p className={styles.question}> {qna.question} </p>
          <div className={styles.answer}>
            <input
              type="text"
              disabled={localChallenges[index].correct !== undefined}
              value={localChallenges[index].answer}
              onChange={(e) => handleAnswerChanged(index, e.target.value)}
              className={styles.input}
            />
            <div className={styles.answerVerification}>
              {isSubmitting ? (
                <Spinner size={16} />
              ) : ( 
                <div>
                  {localChallenges[index].correct === true && (
                    <div style={{ color: 'green' }}>✔️</div>
                  )}
                  {localChallenges[index].correct === false && (
                    <div style={{ color: 'red' }}>❌</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <p className={styles.explaination}>
            {localChallenges[index].explaination}
          </p>
        </div>
      ))}
    </div>
  );
};

export default PassageChallenges;
