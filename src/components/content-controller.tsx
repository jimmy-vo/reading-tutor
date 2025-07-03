import React from 'react';
import styles from './content-controller.module.css';

interface ContentControllerProps {
  className?: string;
  onSubmit: () => void;
  onNext: () => void;
  isSubmitDisabled: boolean;
  isNextDisabled: boolean;
}

const ContentController: React.FC<ContentControllerProps> = ({
  className,
  onSubmit,
  onNext,
  isSubmitDisabled,
  isNextDisabled,
}) => {
  return (
    <div className={className}>
      <button
        className={styles.button}
        onClick={onSubmit}
        disabled={isSubmitDisabled}
      >
        Submit
      </button>

      <button
        className={styles.button}
        onClick={onNext}
        disabled={isNextDisabled}
      >
        Next
      </button>
    </div>
  );
};

export { ContentController };
