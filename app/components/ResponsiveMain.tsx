import React from 'react';
import styles from './ResponsiveMain.module.css';
import { useProgress } from '../context/ProgressProvider';
import PassageContainer from './PassageContainer';
import PassageChallenges from './PassageChallenges';
import { PageAnimation, PageAnimationHelper } from './PageAnimation';

export const ResponsiveMain: React.FC<{
  className?: string;
  selectedItemId: string;
  onCurrentIdChanged: (id: string) => void;
}> = ({ className, selectedItemId, onCurrentIdChanged }) => {
  const { progressService: progressManager } = useProgress();

  return (
    <PageAnimation
      onCurrentIdChanged={onCurrentIdChanged}
      selectedId={selectedItemId}
      className={`${styles.bookContainer} ${className}`}
    >
      {progressManager
        .getItems()
        .map((item) => [
          <div
            className={styles.textContainer}
            key={PageAnimationHelper.toKey(item.id)}
          >
            <PassageContainer
              topic={item.topic}
              imageId={item.image}
              text={item.text}
            />
          </div>,
          <div
            className={styles.challengesContainer}
            key={`${item.id}-challenges`}
          >
            <PassageChallenges item={item} />
          </div>,
        ])
        .flat()}
    </PageAnimation>
  );
};
