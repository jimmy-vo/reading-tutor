import React, { useState, useEffect } from 'react';
import styles from './PassageChallenges.module.css';
import Spinner from './Spinner';
import { ContentSet } from '../models/view/interface';
import { useProgress } from '../context/ProgressProvider';
import Button from './Button';

interface PassageChallengesProps {
  item: ContentSet;
  key?: React.Key;
}

const PassageChallenges: React.FC<PassageChallengesProps> = ({ item, key }) => {
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
    <div className={styles.container} key={key}>
      <div aria-hidden="true" className={styles.inputContainer}>
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
                      <div style={{ color: 'active' }}>✔️</div>
                    )}
                    {localChallenges[index].correct === false && (
                      <div style={{ color: 'incorrect' }}>❌</div>
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

      {item.challenges.every((x) => x.correct === undefined) && (
        <div className={styles.buttonContainer}>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
            &#10004;
          </Button>
        </div>
      )}
    </div>
  );
};

export default PassageChallenges;
