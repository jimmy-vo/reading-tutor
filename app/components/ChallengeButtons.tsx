import React from 'react';
import Button from './Button';

interface ChallengeButtonsProps {
  className?: string;
  onSubmit: () => void;
  onNext: () => void;
  isSubmitDisabled: boolean;
  isNextDisabled: boolean;
}

const ChallengeButtons: React.FC<ChallengeButtonsProps> = ({
  className,
  onSubmit,
  onNext,
  isSubmitDisabled,
  isNextDisabled,
}) => {
  return (
    <div className={className}>
      <Button onClick={onSubmit} disabled={isSubmitDisabled}>
        Submit
      </Button>

      <Button onClick={onNext} disabled={isNextDisabled}>
        Next
      </Button>
    </div>
  );
};

export { ChallengeButtons as ContentController };
