import React from 'react';
import styles from './sidebar.module.css';
import Scores from './scores';
import { ContentSet } from '../models/view';

interface SideBarProps {
  history: ContentSet[];
  current: ContentSet;
  onSelect: (topic: string) => void;
  onResetTap: () => void;
}

export const SideBar: React.FC<SideBarProps> = ({
  history,
  current,
  onSelect,
  onResetTap,
}) => {
  const handleSelect = (topic: string) => {
    onSelect(topic);
  };

  return (
    <div className={styles.container}>
      <ul className={styles.historyContainer}>
        {[
          ...(history.find((x) => x.topic === current.topic) ? [] : [current]),
          ...history,
        ].map((item) => (
          <li
            className={styles.historyItem}
            key={item.topic}
            onClick={() => handleSelect(item.topic)}
          >
            <div className={styles.topic}>{item.topic}</div>
            {item.challenges.every((x) => x.correct !== undefined) && (
              <div className={styles.score}>
                {item.challenges.filter((q) => q.correct).length}/
                {item.challenges.length}
              </div>
            )}
          </li>
        ))}
      </ul>
      <Scores
        className={styles.scoreContainer}
        reports={history}
        onResetTap={onResetTap}
      />
    </div>
  );
};
