import React from 'react';
import Button from './Button';

interface ChallengeButtonsProps {
  className?: string;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
}

const ChallengeButtons: React.FC<ChallengeButtonsProps> = ({
  className,
  onSubmit,
  isSubmitDisabled,
}) => {
  return (
    <div className={className}>
      <Button onClick={onSubmit} disabled={isSubmitDisabled}>
        Submit
      </Button>
    </div>
  );
};

export { ChallengeButtons as ContentController };
