import React from 'react';
import Button from './Button';
import { useProgress } from '../context/ProgressProvider';
import { ContentSet } from '../models/view/interface';

interface ChallengeButtonsProps {
  className?: string;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
  onItemSelect: (item: ContentSet) => void;
}

const ChallengeButtons: React.FC<ChallengeButtonsProps> = ({
  className,
  onSubmit,
  isSubmitDisabled,
  onItemSelect,
}) => {
  const { selectedItem, setSelectedItem, progressManager } = useProgress();
  const others = progressManager.getOtherItems(selectedItem);
  return (
    <div className={className}>
      <Button
        onClick={() => {
          setSelectedItem(others.prev);
          onItemSelect(others.prev);
        }}
        disabled={others.prev === null}
      >
        Back
      </Button>

      <Button onClick={onSubmit} disabled={isSubmitDisabled}>
        Submit
      </Button>

      <Button
        onClick={() => {
          setSelectedItem(others.next);
          onItemSelect(others.next);
        }}
        disabled={others.next === null}
      >
        Next
      </Button>
    </div>
  );
};

export { ChallengeButtons as ContentController };
