import ContentComponent from '../components/ResponsiveMain';
import ProgressBar from '../components/ProgressBar';
import styles from './index.module.css';
import { useState, useEffect, useRef } from 'react';
import Spinner from '../components/Spinner';
import VictoryAnimation from '../components/VictoryAnimation';
import { ContentSet } from '../models/view';
import { Drawer } from '../components/Drawer';
import { GradeStorage, HistoryStorage } from '../services/storageService';
import { ContentClient } from '../services/clientSerivce';
import {
  appendHistory,
  generateNewContent,
  getActiveContentStorage,
  resetHistory,
  updateFromHistory,
  updateHistory,
} from '../services/appService';

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
      const activeContent = await getActiveContentStorage(history, grade);
      setActiveItem(activeContent);
      setSelectedItem(activeContent);
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
    console.info(`Generate next content for Grade ${grade}`);
    const contentSet = await generateNewContent(history, grade);
    onPostCreate(contentSet);
  };

  const handleSubmit = async (newContentSet: ContentSet) => {
    if (!selectedItem) return;

    setLoading(true);
    const evaluationResult = await ContentClient.getEvaluation(newContentSet);
    setLoading(false);

    const newItem: ContentSet = {
      grade: newContentSet.grade,
      text: selectedItem.text,
      topic: selectedItem.topic,
      image: undefined,
      challenges: evaluationResult,
    };
    setActiveItem(newItem);
    setSelectedItem(newItem);
    const newHistory = appendHistory(newItem);
    setHistory(newHistory);

    if (updateFromHistory(newHistory)) {
      setGrade(GradeStorage.read());
    }

    const allCorrect =
      evaluationResult.filter((x) => x.correct === true).length ==
      evaluationResult.length;

    if (!allCorrect) return;
    console.info('All answers are correct');
    await new Promise<void>((resolve) => {
      console.info('Congrats!!!');
      setShowCongrats(50);
      // set image to null to display loading
      const newItemWithLoadingImage: ContentSet = {
        grade: newContentSet.grade,
        text: selectedItem.text,
        topic: selectedItem.topic,
        image: null,
        challenges: evaluationResult,
      };
      setActiveItem(newItemWithLoadingImage);
      setSelectedItem(newItemWithLoadingImage);
      resolve();
    }).then(() => {
      console.info('Generating image...');
      return ContentClient.getImage(newContentSet)
        .then((imageId) => {
          console.info('Get the image...');
          // set the image id when it is ready
          const newItemWithImage: ContentSet = {
            grade: newContentSet.grade,
            text: selectedItem.text,
            topic: selectedItem.topic,
            image: imageId,
            challenges: evaluationResult,
          };
          setActiveItem(newItemWithImage);
          setSelectedItem(newItemWithImage);
          setHistory(updateHistory(newItemWithImage));
        })
        .catch((e) => {
          console.error(e);
          console.info('Reset image id');
          // reset image
          const newItemWithoutImage: ContentSet = {
            grade: newContentSet.grade,
            text: selectedItem.text,
            topic: selectedItem.topic,
            image: undefined,
            challenges: evaluationResult,
          };
          setActiveItem(newItemWithoutImage);
          setSelectedItem(newItemWithoutImage);
        });
    });
  };

  const toggleDrawer = () => setDrawerOpen(!isDrawerOpen);

  const handleSelect = (topic: string) => {
    setSelectedItem([...history, activeItem!].find((x) => x.topic === topic));
    setDrawerOpen(false);
  };

  const showSpiner = loading || !selectedItem;
  const showCongrats = congratAnimation !== 0;
  const showOveray = showSpiner || showCongrats;

  const hasEvaluation =
    selectedItem?.challenges?.every((x) => x.correct !== undefined) ?? false;

  return (
    <div>
      {showOveray && (
        <div className={styles.loadingOverlay}>
          {showSpiner && <Spinner />}
          {showCongrats && (
            <VictoryAnimation
              length={congratAnimation}
              onAnimationEnd={() => setShowCongrats(0)}
            />
          )}
        </div>
      )}
      {selectedItem && (
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
            isNextDisabled={selectedItem.image === null || !hasEvaluation}
            onSubmit={handleSubmit}
            onNext={handleNext}
          />
        </div>
      )}
    </div>
  );
}
