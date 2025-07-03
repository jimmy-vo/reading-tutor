import React from 'react';
import styles from './reading-report.module.css';
import { ReadingReport } from '../models/view';
import Scores from './scores';

interface ReadingReportsProps {
  reports: ReadingReport[];
  onSelect: (topic: string) => void;
  onResetTap: () => void;
}

const ReadingReportsComponent: React.FC<ReadingReportsProps> = ({
  reports,
  onSelect,
  onResetTap,
}) => {
  const handleSelect = (topic: string) => {
    onSelect(topic);
  };

  return (
    <div>
      <Scores
        className={styles.scoreContainer}
        reports={reports}
        onResetTap={onResetTap}
      />
      <ul className={styles.reportList}>
        {reports.map((report) => (
          <li
            className={styles.reportItem}
            key={report.contentSet.topic}
            onClick={() => handleSelect(report.contentSet.topic)}
          >
            <div className={styles.topic}>Topic: {report.contentSet.topic}</div>
            <div className={styles.correctAnswers}>
              Correct Answers:{' '}
              {report.evaluation.filter((q) => q.correct).length}/
              {report.evaluation.length}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReadingReportsComponent;
