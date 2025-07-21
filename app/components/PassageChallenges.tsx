import React, { useState, useEffect } from 'react';
import styles from './PassageChallenges.module.css';
import Spinner from './Spinner';
import { ContentSet } from '../models/view/interface';
import { useProgress } from '../context/ProgressProvider';
import Button from './Button';

interface PassageChallengesProps {
  item: ContentSet;
}

const PassageChallenges: React.FC<PassageChallengesProps> = ({ item }) => {
  const { submit } = useProgress();
  const [localChallenges, setChallenges] = useState(item.challenges);
  const [isSubmitDisabled, setSubmitDisabled] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    setChallenges(item.challenges);
  }, [item]);

  const handleSubmit = async () => {
    setSubmitDisabled(true);
    setSubmitting(true);
    await submit({ ...item, challenges: localChallenges });
    setSubmitting(false);
  };

  const handleAnswerChanged = (index: number, value: string) => {
    const updatedChallenges = [...localChallenges];
    updatedChallenges[index].answer = value;
    setChallenges(updatedChallenges);
    setSubmitDisabled(
      updatedChallenges.filter((x) => x.answer.trim().length > 0).length <
        updatedChallenges.length,
    );
  };

  return (
    <div>
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

      {item.challenges.every(x => x.correct === undefined) && (
        <div className={styles.ButtonContainer}>
          <Button
            className={styles.fancyButton}
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
};

export default PassageChallenges;
