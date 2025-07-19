import React from 'react';
import styles from './ProgressBar.module.css';
import { GradeState, ItemState } from '../models/view/interface';
import { useProgress } from '../context/ProgressProvider';

interface ProgressDotsProps {
  className?: string;
  selectedGrade?: number;
  onGradeSelected?: (gradeId: number) => void;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({
  className,
  selectedGrade,
  onGradeSelected,
}) => {
  const { grades, selectedItem, setSelectedItem } = useProgress();

  return (
    <div className={className} aria-hidden="true">
      {grades.map((gradeGroup) => {
        const expanded = selectedGrade === gradeGroup.id;
        return (
          <div key={`grade-${gradeGroup.id}`} className={styles.gradeGroup}>
            {/* Big dot for grade */}
            <div
              className={[
                styles.bigDot,
                (function () {
                  switch (gradeGroup.state) {
                    case GradeState.completed:
                      return styles.orange;
                    case GradeState.active:
                      return styles.green;
                    default:
                      return styles.grey;
                  }
                })(),
              ].join(' ')}
              onClick={() => onGradeSelected(gradeGroup.id)}
              style={{ cursor: 'pointer' }}
            >
              {gradeGroup.id}
            </div>
            {/* Small dots for ContentSets */}
            <div className={styles.smallDotsRow}>
              {gradeGroup.items.map((dot, idx) => (
                <div
                  key={`grade-${gradeGroup.id}-dot-${idx}`}
                  onClick={() =>
                    dot.value.topic !== selectedItem?.topic && dot.value
                      ? setSelectedItem(dot.value)
                      : undefined
                  }
                  style={{
                    cursor: dot.value !== undefined ? 'pointer' : 'default',
                  }}
                  className={[
                    styles.smallDot,
                    (() => {
                      switch (dot.state) {
                        case ItemState.incorrect:
                          return styles.red;
                        case ItemState.invalidCorrect:
                        case ItemState.validCorrect:
                          return styles.orange;
                        case ItemState.active:
                          return styles.green;
                        case ItemState.toDo:
                          return styles.grey;
                        default:
                          return '';
                      }
                    })(),
                    expanded ? styles.expanded : styles.collapsed,
                    dot.value === undefined ? styles.noHover : '',
                    dot.value?.topic == selectedItem?.topic && expanded
                      ? styles.selected
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
