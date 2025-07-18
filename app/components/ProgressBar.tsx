import React, { useState } from 'react';
import styles from './ProgressBar.module.css';
import {
  ContentSet,
  GradeGroup,
  GradeState,
  ItemState,
} from '../models/view/interface';

interface ProgressDotsProps {
  gradeGroups: GradeGroup[];
  selectedItem: ContentSet;
  onContentSetTapped: (contentSet: ContentSet) => void;
  className?: string;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({
  gradeGroups,
  selectedItem,
  onContentSetTapped,
  className,
}) => {
  const [expandedGradeId, setExpandedGradeId] = useState<number | null>(null);

  const handleBigDotClick = (gradeId: number) => {
    setExpandedGradeId((prev) => (prev === gradeId ? null : gradeId));
  };

  return (
    <div className={className} aria-hidden="true">
      {gradeGroups.map((gradeGroup) => {
        const expanded = expandedGradeId === gradeGroup.gradeId;
        return (
          <div
            key={`grade-${gradeGroup.gradeId}`}
            className={styles.gradeGroup}
          >
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
              onClick={() => handleBigDotClick(gradeGroup.gradeId)}
              style={{ cursor: 'pointer' }}
            >
              {gradeGroup.gradeId}
            </div>
            {/* Small dots for ContentSets */}
            <div className={styles.smallDotsRow}>
              {gradeGroup.dots.map((dot, idx) => (
                <div
                  key={`grade-${gradeGroup.gradeId}-dot-${idx}`}
                  onClick={() =>
                    dot.contentSet.topic !== selectedItem.topic &&
                    dot.contentSet
                      ? onContentSetTapped(dot.contentSet)
                      : undefined
                  }
                  style={{
                    cursor:
                      dot.contentSet !== undefined ? 'pointer' : 'default',
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
                        case ItemState.todo:
                          return styles.grey;
                        default:
                          return '';
                      }
                    })(),
                    expanded ? styles.expanded : styles.collapsed,
                    dot.contentSet === undefined ? styles.noHover : '',
                    dot.contentSet?.topic == selectedItem?.topic && expanded
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
