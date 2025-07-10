import React from 'react';
import styles from './ProgressBar.module.css';
import { Grade } from '../models/backend';
import { ContentSet } from '../models/view';
import { AppService } from '../services/appService';
import { Env } from '../services/configService';

interface ProgressBarProps {
  history: ContentSet[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ history }) => {
  const hasNotVerified =
    history[0]?.challenges?.every((x) => x.correct !== undefined) ?? false;
  const currentGrade = history[0]?.grade ?? 0;
  let currentCount = AppService.countAllCorrectInArrow(history, currentGrade);
  const getClassName = (grade: Grade, index: number) => {
    let name = styles.milestone;
    if (index == 1) {
      name += ' ' + styles.bigMilestone;
    }
    if (grade.id < currentGrade) return name + ' ' + styles.completed;
    if (grade.id > currentGrade) return name;

    if (index === currentCount + 1)
      return name + ' ' + (!hasNotVerified ? styles.current : '');
    if (index < currentCount + 1) return name + ' ' + styles.completed;
    return name;
  };

  return (
    <div className={styles.container} aria-hidden="true">
      {Env.grades.map((grade) => (
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
