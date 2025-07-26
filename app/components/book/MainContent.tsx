import React, { useState, useEffect, useRef } from 'react';
import { useProgress } from '../../context/ProgressProvider';
import PassageContainer from './PassageContainer';
import PassageChallenges from './PassageChallenges';
import styles from './MainContent.module.css';

import { PageAnimation, PageAnimationHelper } from './PageAnimation';

export const MainContent: React.FC<{
  className?: string;
  selectedItemId: string;
  onCurrentIdChanged: (id: string) => void;
}> = ({ className, selectedItemId, onCurrentIdChanged }) => {
  const { progressService: progressManager } = useProgress();

  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        setIsSmallScreen(ref.current.getBoundingClientRect().width <= 768);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {isSmallScreen ? (
        [
          <MemoizedPassageContainer
            item={progressManager
              .getItems()
              .find((item) => item.id === selectedItemId)}
            key={PageAnimationHelper.toKey(selectedItemId)}
          />,
          <MemoizedPassageChallenges
            item={progressManager
              .getItems()
              .find((item) => item.id === selectedItemId)}
            key={`${selectedItemId}-challenges`}
          />,
        ]
      ) : (
        <div className={styles.pageAnimationWrapper}>
          <PageAnimation
            className={styles.pageAnimation}
            onCurrentIdChanged={onCurrentIdChanged}
            selectedId={selectedItemId}
          >
            {progressManager
              .getItems()
              .map((item) => [
                <MemoizedPassageContainer
                  item={item}
                  key={PageAnimationHelper.toKey(item.id)}
                />,
                <MemoizedPassageChallenges
                  item={item}
                  key={`${item.id}-challenges`}
                />,
              ])
              .flat()}
          </PageAnimation>
        </div>
      )}
    </div>
  );
};

const MemoizedPassageContainer = React.memo(PassageContainer);
const MemoizedPassageChallenges = React.memo(PassageChallenges);
