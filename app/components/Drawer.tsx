import React, { useEffect, useState } from 'react';
import styles from './Drawer.module.css';
import { ContentSet } from '../models/view';
import { getShowResetFromStorage } from '../services/configService';
import Button from './Button';

interface DrawerProps {
  history: ContentSet[];
  topic: string;
  onSelect: (topic: string) => void;
  onResetTap: () => void;
}

export const Drawer: React.FC<DrawerProps> = ({
  history,
  onSelect,
  onResetTap,
}) => {
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    setShowReset(getShowResetFromStorage());
  }, []);

  return (
    <div className={styles.container} aria-hidden="true">
      <ul className={styles.historyContainer}>
        {history.map((item, index) => (
          <li
            className={styles.historyItem}
            key={index}
            onClick={() => onSelect(item.topic)}
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
      {showReset && (
        <div className={styles.resetContainer}>
          <Button onClick={onResetTap}>Reset</Button>
        </div>
      )}
    </div>
  );
};
