import { MainContent } from '../components/MainContent';
import { ProgressDots } from '../components/ProgressBar';
import InactiveTracker from '../components/InactiveTracker';
import styles from './index.module.css';
import { useState } from 'react';
import { ProgressProvider } from '../context/ProgressProvider';
import VictoryAnimation from '../components/VictoryAnimation';
import { ContentSet, GradeGroup } from '../models/view/interface';

const SUCCEED_AUDIO = 'victory.mp3';
const FAILED_AUDIO = 'fail.mp3';
const ALARM_AUDIO = 'alarm.mp3';

export default function Home() {
  const [congratAnimation, setShowCongrats] = useState(0);
  const [selectedGradeId, setSelectedGradeId] = useState<number>(-1);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [currentItemId, setCurrentItemId] = useState<string>('');
  const [grades, setGrades] = useState<GradeGroup[]>([]);
  const [_, setActiveItem] = useState<ContentSet>();
  const showCongrats = congratAnimation !== 0;

  const playSound = (file: string) => {
    const audio = new Audio(file);
    audio.play();
  };

  const handleAlarm = (): void => {
    console.debug('handleAlarm');
    return playSound(ALARM_AUDIO);
  };

  const handleSucceeded = (gradeId: number) => {
    console.debug('handleSucceeded', gradeId);
    setShowCongrats(50);
    playSound(SUCCEED_AUDIO);
    setSelectedGradeId(gradeId);
  };

  const handleFailed = (gradeId: number) => {
    console.debug('handleFailed', gradeId);
    setShowCongrats(0);
    playSound(FAILED_AUDIO);
  };

  const handleItemChanged = (item: ContentSet) => {
    console.debug('handleItemChanged', item);
    setActiveItem(item);
  };
  const handleIGradesChanged = (grades: GradeGroup[]) => {
    console.debug('handleIGradesChanged', grades);
    setGrades(grades);
  };

  const handleReady = (gradeId: number, itemId: string) => {
    console.debug('handleReady', gradeId, itemId);
    setSelectedItemId(itemId);
    setSelectedGradeId(gradeId);
  };

  console.debug('Home');
  return (
    <div className={styles.container}>
      {showCongrats && (
        <VictoryAnimation
          length={congratAnimation}
          onAnimationEnd={() => setShowCongrats(0)}
        />
      )}
      <ProgressProvider
        onGradesChanged={handleIGradesChanged}
        onSucceeded={handleSucceeded}
        onFailed={handleFailed}
        onActiveItemChanged={handleItemChanged}
        onReady={handleReady}
      >
        {selectedItemId !== '' && (
          <ProgressDots
            className={styles.progressBar}
            grades={grades}
            selectedGradeId={selectedGradeId}
            currentItemId={currentItemId}
            onGradeIdSelected={setSelectedGradeId}
            onItemIdSelected={setSelectedItemId}
          />
        )}
        {selectedItemId !== '' && (
          <MainContent
            className={styles.bookCover}
            selectedItemId={selectedItemId}
            onCurrentIdChanged={setCurrentItemId}
          />
        )}
      </ProgressProvider>
      {selectedItemId !== '' && (
        <InactiveTracker
          className={styles.inactiveTracker}
          onAlarm={handleAlarm}
        />
      )}
    </div>
  );
}
