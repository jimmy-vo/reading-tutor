import React from 'react';
import styles from './control-button.module.css';

interface ControlButtonsProps {
  showNextButton: boolean;
  onResetTap: () => void;
  onNewTopicTap: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  showNextButton: showNextButton,
  onResetTap: handleReset,
  onNewTopicTap: handleNewTopic,
}) => {
  return (
    <div className={styles.buttonsContainer}>
      <button className={styles.button} onClick={handleReset}>
        Reset
      </button>

      <button
        className={styles.button}
        disabled={!showNextButton}
        onClick={handleNewTopic}
      >
        Next
      </button>
    </div>
  );
};

export default ControlButtons;
