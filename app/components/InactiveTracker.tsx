import React, { useEffect, useState } from 'react';
import { InactiveTrackerService } from '../services/inactiveTrackerService';
import styles from './InactiveTracker.module.css';

interface InactiveTrackerProps {
  className?: string;
  onAlarm: () => void;
}

const InactiveTracker: React.FC<InactiveTrackerProps> = ({
  className,
  onAlarm,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    InactiveTrackerService.register((value) => {
      setProgress(value);
      if (value === progress) return;
      if (value <= 0) {
        onAlarm();
      }
    });

    return () => {
      InactiveTrackerService.stop();
    };
  }, []);

  return (
    <div className={className}>
      <div
        className={styles.progressBar}
        style={{
          width: `${progress}%`,
          backgroundColor: `rgb(${100 - progress}%, ${progress}%, 0%)`,
        }}
      ></div>
    </div>
  );
};

export default InactiveTracker;
