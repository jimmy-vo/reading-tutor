import React from 'react';
import styles from './PassageContainer.module.css';

interface PassageContainerProps {
  topic: string;
  text: string;
}

const PassageContainer: React.FC<PassageContainerProps> = ({ topic, text }) => {
  return (
    <div>
      <p className={styles.title}> {topic} </p>
      <p className={styles.paragraph}> {text} </p>
    </div>
  );
};

export default PassageContainer;
