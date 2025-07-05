import React from 'react';
import styles from './ProgressBar.module.css';
import { Grade } from '../models/backend';
import { ContentSet } from '../models/view';
import { countAllCorrectInArrow } from '../services/historyService';
import { Config } from '../services/configService';

interface ProgressBarProps {
  history: ContentSet[];
  grade: number;
  showCurrent: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  history,
  grade: currentGrade,
  showCurrent,
}) => {
  let currentCount = countAllCorrectInArrow(history, currentGrade);

  const getClassName = (grade: Grade, index: number) => {
    let name = styles.milestone;
    if (index == 1) {
      name += ' ' + styles.bigMilestone;
    }
    if (grade.id < currentGrade) return name + ' ' + styles.completed;

    if (grade.id === currentGrade) {
      if (index === currentCount + 1)
        return name + ' ' + (showCurrent ? styles.current : '');
      if (index <= currentCount) return name + ' ' + styles.completed;
    }
    return name;
  };

  return (
    <div className={styles.container}>
      {Config.grades.map((grade) => (
        <React.Fragment key={`grade-fragment-${grade.id}`}>
          {Array.from({ length: grade.count }).map((_, index) => (
            <div key={index} className={getClassName(grade, index + 1)}>
              {index == 0 ? grade.id : ''}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressBar;
