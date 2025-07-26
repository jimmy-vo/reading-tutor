import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import styles from './PassageContainer.module.css';
import Image from 'next/image';
import Spinner from '../common/Spinner';
import WordComponent from './WordComponent';
import { useProgress } from '../../context/ProgressProvider';
import { ContentSet } from '../../models/view/interface';

interface PassageContainerProps {
  item: ContentSet;
  key?: React.Key;
}

const PassageContainer: React.FC<PassageContainerProps> = ({ item }) => {
  const componentRef = useRef(null);
  const { progressService } = useProgress();
  const captureImage = () => {
    if (componentRef.current) {
      html2canvas(componentRef.current).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        const currentDateTime = new Date()
          .toISOString()
          .replace(/T/, '-')
          .replace(/:/g, '-')
          .split('.')[0];
        link.download = `${currentDateTime}-${item.topic}.png`;
        link.click();
      });
    }
  };
  return (
    <div ref={componentRef} className={styles.container}>
      <p className={styles.title}>
        {item.topic.split(' ').map((word, index) => (
          <WordComponent key={index} word={word} />
        ))}
      </p>
      <p className={styles.paragraph}>
        {item.passage.split(' ').map((word, index) => (
          <WordComponent key={index} word={word} />
        ))}
      </p>
      {(() => {
        switch (true) {
          case item.image === null:
            return (
              <div className={styles.spinner}>
                <Spinner />
              </div>
            );
          case item.image === undefined:
            return null;
          default:
            return (
              <Image
                onClick={captureImage}
                src={`/api/history/${progressService.getHistoryId()}/${
                  item.id
                }/image`}
                className={styles.image}
                alt={item.topic}
                width={500}
                height={300}
              />
            );
        }
      })()}
    </div>
  );
};

export default PassageContainer;
