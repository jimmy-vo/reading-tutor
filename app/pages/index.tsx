import ContentComponent from '../components/ResponsiveMain';
import ProgressBar from '../components/ProgressBar';
import { HistoryStorage } from '../services/historyService';
import styles from './index.module.css';
import { useState, useEffect, useRef } from 'react';
import VictoryAnimation from '../components/VictoryAnimation';
import {
  generateNewContent,
  getActiveContentStorage as getActiveContent,
  verifyAnswers,
} from '../services/contentService';
import { ContentSet } from '../models/view';
import { updateHistory, resetHistory } from '../services/historyService';
import { Drawer } from '../components/Drawer';
import { GradeStorage, updateFromHistory } from '../services/gradeService';

export interface Answer {
  id: string;
  expectedAnswer: string;
  obtainedAnswer: string;
}

export default function Home() {
  const [history, setHistory] = useState<ContentSet[]>([]);
  const [grade, setGrade] = useState<number>(0);
  const [activeItem, setActiveItem] = useState<ContentSet>();
  const [selectedItem, setSelectedItem] = useState<ContentSet>();
  const [loading, setLoading] = useState(true);
  const [congratAnimation, setShowCongrats] = useState(0);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      while (typeof window === 'undefined') {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      setHistory(HistoryStorage.read());
      setGrade(GradeStorage.read());
      const activeContent = await getActiveContent(history, grade);
      setActiveItem(activeContent);
      onPostCreate(activeContent);
    };

    fetchData();
  }, []);

  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setDrawerOpen(false);
      }
    };

    if (isDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDrawerOpen]);

  const handleReset = async () => {
    setLoading(true);
    setDrawerOpen(false);
    resetHistory();
    setHistory([]);
    await handleNext();
  };

  const onPostCreate = (contentSet: ContentSet) => {
    setActiveItem(contentSet);
    setSelectedItem(contentSet);
    setLoading(false);
  };

  const handleNext = async () => {
    setLoading(true);
    const contentSet = await generateNewContent(history, grade);
    onPostCreate(contentSet);
  };

  const handleSubmit = async (newContentSet: ContentSet) => {
    if (!activeItem) return;

    setLoading(true);
    const evaluationResult = await verifyAnswers(newContentSet);
    setLoading(false);
    if (
      evaluationResult.filter((x) => x.correct === true).length ==
      evaluationResult.length
    ) {
      setShowCongrats(50);
    }
    const newItem: ContentSet = {
      grade: newContentSet.grade,
      text: activeItem.text,
      topic: activeItem.topic,
      challenges: evaluationResult,
    };
    setActiveItem(newItem);
    const newHistory = updateHistory(newItem);
    setHistory(newHistory);
    if ( updateFromHistory(newHistory))
    {
      setGrade(GradeStorage.read())
    }
  };

  const toggleDrawer = () => setDrawerOpen(!isDrawerOpen);

  const handleSelect = (topic: string) => {
    setSelectedItem([...history, activeItem!].find((x) => x.topic === topic));
    setDrawerOpen(false);
  };

  const showSpiner = loading || !activeItem;
  const showCongrats = congratAnimation !== 0;
  const showOveray = showSpiner || showCongrats;

  const hasEvaluation =
    activeItem?.challenges?.every((x) => x.correct !== undefined) ?? false;
  return (
    <div>
      {showOveray && (
        <div className={styles.loadingOverlay}>
          {showSpiner && <div className={styles.loadingSpinner}></div>}
          {showCongrats && (
            <VictoryAnimation
              length={congratAnimation}
              onAnimationEnd={() => setShowCongrats(0)}
            />
          )}
        </div>
      )}
      {activeItem && (
        <div className={styles.container}>
          <button className={styles.hamburgerButton} onClick={toggleDrawer}>
            ☰
          </button>
          <div
            ref={drawerRef}
            className={`${styles.drawer} ${
              isDrawerOpen ? styles.drawerOpen : ''
            }`}
          >
            <Drawer
              onSelect={handleSelect}
              onResetTap={handleReset}
              history={history}
              current={activeItem}
            />
          </div>
          {true && (
            <ProgressBar
              history={history}
              grade={grade}
              showCurrent={!hasEvaluation}
            />
          )}
          <ContentComponent
            className={styles.mainContainer}
            item={selectedItem!}
            isNextDisabled={!hasEvaluation}
            onSubmit={handleSubmit}
            onNext={handleNext}
          />
        </div>
      )}
    </div>
  );
}
