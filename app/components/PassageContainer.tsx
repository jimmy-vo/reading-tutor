import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import styles from './PassageContainer.module.css';
import Spinner from './Spinner';

interface PassageContainerProps {
  topic: string;
  imageId: string;
  text: string;
}

const PassageContainer: React.FC<PassageContainerProps> = ({
  topic,
  imageId,
  text,
}) => {
  const componentRef = useRef(null);

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
        link.download = `${currentDateTime}-${topic}.png`;
        link.click();
      });
    }
  };

  return (
    <div ref={componentRef} className={styles.container}>
      <p className={styles.title}> {topic} </p>
      <p className={styles.paragraph}> {text} </p>
      {(() => {
        switch (true) {
          case imageId === null:
            return (
              <div className={styles.spinner}>
                <Spinner />
              </div>
            );
          case imageId === undefined:
            return null;
          default:
            return (
              <img
                onClick={captureImage}
                src={`/api/images/${imageId}`}
                className={styles.image}
                alt={topic}
              />
            );
        }
      })()}
    </div>
  );
};

export default PassageContainer;
