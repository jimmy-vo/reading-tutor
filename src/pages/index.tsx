import ContentComponent from '../components/main-content';
import ProgressBar from '../components/ProgressBar';
import { getHistoryFromStorage } from '../services/history-service';
import styles from './index.module.css';
import { useState, useEffect, useRef } from 'react';
import LevelUpAnimation from '../components/LevelUpAnimation';
import {
  generateNewContent,
  getActiveContentStorage,
  verifyAnswers,
} from '../services/content-service';
import { ContentSet } from '../models/view';
import {
  addHistoryToStorage,
  resetHistoryStorage,
} from '../services/history-service';
import { SideBar } from '../components/sidebar';
import { readLevel, updateFromHistory } from '../services/level-service';

export interface Answer {
  id: string;
  expectedAnswer: string;
  obtainedAnswer: string;
}

export default function Home() {
  const [history, setHistory] = useState<ContentSet[]>([]);
  const [activeItem, setActiveItem] = useState<ContentSet>();
  const [selectedItem, setSelectedItem] = useState<ContentSet>();
  const [loading, setLoading] = useState(false);
  const [localStorageReady, setLocalStorageReady] = useState(false);
  const [congratAnimation, setShowCongrats] = useState(0);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      while (typeof window === 'undefined') {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      setLocalStorageReady(true);
      const newcontentSet = await getActiveContentStorage();
      setActiveItem(newcontentSet);
      onPostCreate(newcontentSet);

      const reportData = await getHistoryFromStorage();
      setHistory(reportData);
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
    resetHistoryStorage();
    setHistory([]);
    await handleNext();
  };

  const onPostCreate = (contentSet: ContentSet) => {
    setLoading(false);

    setActiveItem(contentSet);
    setSelectedItem(contentSet);
  };

  const handleNext = async () => {
    setLoading(true);
    const contentSet = await generateNewContent();
    onPostCreate(contentSet);
  };

  const handleSubmit = async (newContentSet: ContentSet) => {
    if (!activeItem) return;

    setLoading(true);
    const evaluationResult = await verifyAnswers(newContentSet);
    setLoading(false);
    const newItem = {
      grade: newContentSet.grade,
      text: activeItem.text,
      topic: activeItem.topic,
      challenges: evaluationResult,
    };
    addHistoryToStorage(newItem);
    setActiveItem(newItem);
    const histroy = await getHistoryFromStorage();
    setHistory(histroy);
    updateFromHistory(histroy);
    if (
      evaluationResult.filter((x) => x.correct === true).length ==
      evaluationResult.length
    ) {
      setShowCongrats(50);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  const handleSelect = (topic: string) => {
    setSelectedItem([...history, activeItem!].find((x) => x.topic === topic));
    setDrawerOpen(false);
  };

  const showSpiner = (): boolean =>
    !localStorageReady || loading || !activeItem;
  const showOveray = (): boolean => showSpiner() || showCongrats();
  const showCongrats = (): boolean => congratAnimation !== 0;

  const hasEvaluation =
    activeItem?.challenges?.every((x) => x.correct !== undefined) ?? false;
  return (
    <div>
      {showOveray() && (
        <div className={styles.loadingOverlay}>
          {showSpiner() && <div className={styles.loadingSpinner}></div>}

          {showCongrats() && (
            <LevelUpAnimation
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
            <SideBar
              onSelect={handleSelect}
              onResetTap={handleReset}
              history={history}
              current={activeItem}
            />
          </div>
          {true && (
            <ProgressBar
              history={history}
              currentLevel={readLevel()}
              showCurrent={!hasEvaluation}
            />
          )}
          <ContentComponent
            className={styles.mainContainer}
            contentSet={selectedItem!}
            isNextDisabled={!hasEvaluation}
            onSubmit={handleSubmit}
            onNext={handleNext}
          />
        </div>
      )}
    </div>
  );
}
