import React from 'react';
import styles from './index.module.css';
import { Content } from './models/content';

interface ContentProps {
  content: Content;
  answers: {
    obtainedAnswer: string;
    correct?: boolean;
    suggestion?: string;
  }[];
  onAnswersChanged: (index: number, value: string) => void;
}

const MainContent: React.FC<ContentProps> = ({
  content,
  answers,
  onAnswersChanged: onAnswersChanged,
}) => {
  return (
    <div className={styles.container}>
      <p className={styles.paragraph}> {content.text} </p>
      {content.qna.map((qna, index) => (
        <div key={qna.id}>
          <p className={styles.question}> {qna.question} </p>
          <input
            type="text"
            value={answers[index]?.obtainedAnswer || ''}
            onChange={(e) => onAnswersChanged(index, e.target.value)}
            className={styles.input}
          />
          {answers[index]?.correct !== undefined && (
            <span>
              {answers[index].correct ? (
                <span style={{ color: 'green' }}>✔️</span>
              ) : (
                <span style={{ color: 'red' }}>❌</span>
              )}
            </span>
          )}
          <p style={{ color: 'blue' }}>{answers[index]?.suggestion || ' '}</p>
        </div>
      ))}
    </div>
  );
};

export default MainContent;
