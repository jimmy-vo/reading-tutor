import React from 'react';
import { useProgress } from '../context/ProgressProvider';
import PassageContainer from './PassageContainer';
import PassageChallenges from './PassageChallenges';
import { PageAnimation, PageAnimationHelper } from './PageAnimation';

export const MainContent: React.FC<{
  className?: string;
  selectedItemId: string;
  onCurrentIdChanged: (id: string) => void;
}> = ({ className, selectedItemId, onCurrentIdChanged }) => {
  const { progressService: progressManager } = useProgress();

  return (
    <PageAnimation
      onCurrentIdChanged={onCurrentIdChanged}
      selectedId={selectedItemId}
      className={className}
    >
      {progressManager
        .getItems()
        .map((item) => [
          <div key={PageAnimationHelper.toKey(item.id)}>
            <PassageContainer
              topic={item.topic}
              imageId={item.image}
              text={item.text}
            />
          </div>,
          <PassageChallenges item={item} key={`${item.id}-challenges`} />,
        ])
        .flat()}
    </PageAnimation>
  );
};
