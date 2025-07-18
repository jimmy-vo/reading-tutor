import ContentComponent from '../components/ResponsiveMain';
import { ProgressDots } from '../components/ProgressBar';
import InactiveTracker from '../components/InactiveTracker';
import styles from './index.module.css';
import { useState, useEffect, useRef } from 'react';
import Spinner from '../components/Spinner';
import VictoryAnimation from '../components/VictoryAnimation';
import { ContentSet } from '../models/view/interface';
import { ContentClient } from '../services/clientSerivce';
import { AppService as AppService } from '../services/appService';

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

  const handleSelect = (item: ContentSet) => {
    const idx = history.findIndex((x) => x.topic == item.topic);
    console.log(idx);
    setSelectedItem(history[idx]);
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
    return await ContentClient.getImage(workingItem)
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
      })
      .finally(async () => {
        await handleGetAll(true, false);
      });
  };

  const showSpiner = loading || !selectedItem;
  const showCongrats = congratAnimation !== 0;
  const showOveray = showSpiner || showCongrats;
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
          <ProgressDots
            selectedItem={selectedItem}
            gradeGroups={AppService.getProgress()}
            className={styles.progressBar}
            onContentSetTapped={handleSelect}
          />
          <ContentComponent
            className={styles.mainContent}
            item={selectedItem!}
            onSubmit={handleSubmit}
          />
          <InactiveTracker className={styles.inactiveTracker} />
        </div>
      )}
    </div>
  );
}
