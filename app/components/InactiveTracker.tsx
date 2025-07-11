import React, { useEffect, useState } from 'react';
import { InactiveTrackerService } from '../services/inactiveTrackerService';
import styles from './InactiveTracker.module.css';

const InactiveTracker: React.FC = () => {
  const [progress, setProgress] = useState(100);
  const [audio, setAudio] = useState<HTMLAudioElement>();

  useEffect(() => {
    setAudio(new Audio('alarm.mp3'));
    InactiveTrackerService.register((value) => {
      setProgress(value);
      if (value <= 0) {
        playAlarm();
      }
    });

    return () => {
      InactiveTrackerService.stop();
    };
  }, []);

  const playAlarm = () => {
    if (!audio) return;
    console.debug('Play alarm');
    audio.play();
  };

  return (
    <div className={styles.progressBarContainer}>
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
