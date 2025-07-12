import ContentComponent from '../components/ResponsiveMain';
import ProgressBar from '../components/ProgressBar';
import InactiveTracker from '../components/InactiveTracker';
import styles from './index.module.css';
import { useState, useEffect, useRef } from 'react';
import Spinner from '../components/Spinner';
import VictoryAnimation from '../components/VictoryAnimation';
import { ContentSet } from '../models/view';
import { Drawer } from '../components/Drawer';
import { ContentClient } from '../services/clientSerivce';
import { AppService as AppService } from '../services/appService';

export interface Answer {
  id: string;
  expectedAnswer: string;
  obtainedAnswer: string;
}

export default function Home() {
  const [history, setHistory] = useState<ContentSet[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContentSet>();
  const [loading, setLoading] = useState(true);
  const [congratAnimation, setShowCongrats] = useState(0);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      while (typeof window === 'undefined') {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      const activeContent = await handleGetAll(true);
      setSelectedItem(activeContent);
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
    AppService.reset();
    const activeContent = await handleGetAll(true);
    setSelectedItem(activeContent);
  };

  const handleNext = async () => {
    console.info(`Generate next content`);
    const activeContent = await handleGetAll(true);
    setSelectedItem(activeContent);
  };

  const handleGetAll = async (
    generate: boolean,
    updateLoading: boolean = true,
  ): Promise<ContentSet> => {
    if (updateLoading) {
      setLoading(true);
    }
    const newHistory = await AppService.getAll(generate);
    setHistory(newHistory);
    if (updateLoading) {
      setLoading(false);
    }

    if (!generate) return null;
    const activeContent = newHistory[0];
    return activeContent;
  };

  const handleSubmit = async (newContentSet: ContentSet) => {
    if (!selectedItem) return;

    const evaluationResult = await ContentClient.getEvaluation(newContentSet);

    const newItem: ContentSet = {
      topic: newContentSet.topic,
      created: newContentSet.created,
      grade: newContentSet.grade,
      text: newContentSet.text,
      image: undefined,
      challenges: evaluationResult,
    };
    AppService.update(newItem);
    handleGetAll(false, false);
    if (!evaluationResult.every((x) => x.correct === true)) return;

    console.info('Congrats!!!');
    setShowCongrats(50);
    // set image to null to display loading
    let workingItem: ContentSet = {
      grade: newItem.grade,
      created: newItem.created,
      text: newItem.text,
      topic: newItem.topic,
      image: null,
      challenges: newItem.challenges,
    };
    setSelectedItem(AppService.update(workingItem));
    console.info('Generating image...');
    return ContentClient.getImage(workingItem)
      .then((imageId) => {
        console.info('Get the image...');
        workingItem.image = imageId;
        setSelectedItem(AppService.update(workingItem));
      })
      .catch((e) => {
        console.error(e);
        console.info('Reset image id');
        workingItem.image = undefined;
        setSelectedItem(AppService.update(workingItem));
      });
  };

  const toggleDrawer = () => setDrawerOpen(!isDrawerOpen);

  const handleSelect = (topic: string) => {
    if (loading) return;
    setSelectedItem(history.find((x) => x.topic === topic));
    setDrawerOpen(false);
  };

  const showSpiner = loading || !selectedItem;
  const showCongrats = congratAnimation !== 0;
  const showOveray = showSpiner || showCongrats;

  const hasEvaluation =
    history[0]?.challenges?.every((x) => x.correct !== undefined) ?? false;

  return (
    <div>
      {showOveray && (
        <div className={styles.loadingOverlay}>{showSpiner && <Spinner />}</div>
      )}
      {showCongrats && (
        <VictoryAnimation
          length={congratAnimation}
          onAnimationEnd={() => setShowCongrats(0)}
        />
      )}
      {selectedItem && (
        <div className={styles.container}>
          <ProgressBar history={history} />
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
              topic={selectedItem.topic}
            />
          </div>
          <ContentComponent
            className={styles.mainContainer}
            item={selectedItem!}
            isNextDisabled={selectedItem.image === null || !hasEvaluation}
            onSubmit={handleSubmit}
            onNext={handleNext}
          />
          <InactiveTracker />
        </div>
      )}
    </div>
  );
}
