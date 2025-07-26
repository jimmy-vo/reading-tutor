import React, { useEffect } from 'react';
import styles from './ProgressBar.module.css';
import { GradeGroup, GradeState, ItemState } from '../../models/view/interface';

interface ProgressDotsProps {
  className?: string;
  grades: GradeGroup[];
  currentItemId?: string;
  selectedGradeId?: number;
  onGradeIdSelected?: (id: number) => void;
  onItemIdSelected?: (id: string) => void;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({
  className,
  grades,
  currentItemId,
  selectedGradeId,
  onGradeIdSelected,
  onItemIdSelected,
}) => {
  useEffect(() => {
    if (selectedGradeId < 0) return;
    if (grades?.length === 0) return;
    if (
      grades
        .find((x) => x.id === selectedGradeId)
        .items.some((x) => x.value && x.value.id === currentItemId)
    )
      return;
    const expectedGradeId = grades.find((x) =>
      x.items.some((x) => x.value && x.value.id === currentItemId),
    )?.id;
    if (!expectedGradeId) return;
    onGradeIdSelected(expectedGradeId);
  }, [currentItemId, grades]);

  if (grades?.length === 0) return <div></div>;

  return (
    <div className={className} aria-hidden="true">
      {grades.map((gradeGroup) => {
        const expanded = selectedGradeId === gradeGroup.id;
        return (
          <div key={`grade-${gradeGroup.id}`} className={styles.gradeGroup}>
            {/* Big dot for grade */}
            <div
              className={[
                styles.bigDot,
                (function () {
                  switch (gradeGroup.state) {
                    case GradeState.completed:
                      return styles.completed;
                    case GradeState.active:
                      return styles.active;
                    default:
                      return styles.remaining;
                  }
                })(),
              ].join(' ')}
              onClick={() => onGradeIdSelected(gradeGroup.id)}
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
                    dot.value ? onItemIdSelected(dot.value.id) : undefined
                  }
                  style={{
                    cursor: dot.value !== undefined ? 'pointer' : 'default',
                  }}
                  className={[
                    styles.smallDot,
                    (() => {
                      switch (dot.state) {
                        case ItemState.incorrect:
                          return styles.incorrect;
                        case ItemState.invalidCorrect:
                        case ItemState.validCorrect:
                          return styles.completed;
                        case ItemState.active:
                          return styles.active;
                        case ItemState.toDo:
                          return styles.remaining;
                        default:
                          return '';
                      }
                    })(),
                    expanded ? styles.expanded : styles.collapsed,
                    dot.value === undefined ? styles.noHover : '',
                    dot.value?.id == currentItemId && expanded
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
