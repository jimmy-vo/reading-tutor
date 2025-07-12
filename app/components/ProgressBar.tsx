import React from 'react';
import styles from './ProgressBar.module.css';
import { Grade } from '../models/backend';
import { ContentSet } from '../models/view';
import { AppService } from '../services/appService';
import { Env } from '../services/configService';

interface ProgressBarProps {
  history: ContentSet[];
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  history,
  className,
}) => {
  const hasNotVerified =
    history[0]?.challenges?.every((x) => x.correct !== undefined) ?? false;
  const currentGrade = history[0]?.grade ?? 0;
  let currentCount = AppService.countAllCorrectInArrow(history, currentGrade);
  const getClassName = (grade: Grade, index: number) => {
    let name = styles.dot;
    if (index == 1) {
      name += ' ' + styles.bigDot;
    }
    if (grade.id < currentGrade) return name + ' ' + styles.completed;
    if (grade.id > currentGrade) return name;

    if (index === currentCount + 1)
      return name + ' ' + (!hasNotVerified ? styles.current : '');
    if (index < currentCount + 1) return name + ' ' + styles.completed;
    return name;
  };

  return (
    <div className={`${className}`} aria-hidden="true">
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

interface HistoryProps {
  history: ContentSet[];
  selectedTopic: string;
  onSelect: (topic: string) => void;
  className?: string;
}

export const HistoryBar: React.FC<HistoryProps> = ({
  history,
  selectedTopic,
  onSelect,
  className,
}) => {
  return (
    <div className={className}>
      {history
        .toSorted((a, b) => a.created!.getTime() - b.created!.getTime())
        .map((item, index) => {
          const isCompleted = item.challenges.every((x) => x.correct);
          const isCurrent = item.challenges.every(
            (x) => x.correct === undefined,
          );
          const isSelected = item.topic === selectedTopic;
          let dotClass = styles.dot;
          if (isCurrent) {
            dotClass += ' ' + styles.current;
          }
          if (isCompleted) {
            dotClass += ' ' + styles.completed;
          }

          if (isSelected) {
            dotClass += ' ' + styles.bigDot;
          }

          return (
            <div className={styles.historyItem}>
              <div
                key={index}
                className={dotClass}
                onClick={() => onSelect(item.topic)}
              >
                <span title={item.topic}>{item.topic}</span>
              </div>
            </div>
          );
        })}
    </div>
  );
};
