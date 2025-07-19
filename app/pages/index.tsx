import { ResponsiveMain } from '../components/ResponsiveMain';
import { ProgressDots } from '../components/ProgressBar';
import InactiveTracker from '../components/InactiveTracker';
import styles from './index.module.css';
import { useState } from 'react';
import { ProgressProvider } from '../context/ProgressProvider';
import VictoryAnimation from '../components/VictoryAnimation';

export default function Home() {
  const [congratAnimation, setShowCongrats] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState(-1);
  const showCongrats = congratAnimation !== 0;

  const handleSubmit = (callback: () => void, gradeId: number) => {
    callback();
    console.log('Asda', gradeId);
    setSelectedGrade(gradeId);
  };
  return (
    <div className={styles.container}>
      {showCongrats && (
        <VictoryAnimation
          length={congratAnimation}
          onAnimationEnd={() => setShowCongrats(0)}
        />
      )}
      <ProgressProvider
        onSucceeded={(gradeId) => {
          return handleSubmit(() => setShowCongrats(50), gradeId);
        }}
        onFailed={(gradeId) => handleSubmit(() => setShowCongrats(0), gradeId)}
      >
        <ProgressDots
          className={styles.progressBar}
          selectedGrade={selectedGrade}
          onGradeSelected={(gradeId) =>
            setSelectedGrade(gradeId != selectedGrade ? gradeId : -1)
          }
        />
        <ResponsiveMain
          className={styles.mainContent}
          onItemSelect={(item) => setSelectedGrade(item.gradeId)}
        />
      </ProgressProvider>
      <InactiveTracker className={styles.inactiveTracker} />
    </div>
  );
}
