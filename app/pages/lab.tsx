import React from 'react';
import ReadingBook from '../components/book/ReadingBook';
import styles from './lab.module.css';

const LabPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.componentWrapper}>
        <button className={styles.exitButton}>Exit</button>
        <ReadingBook />
      </div>
    </div>
  );
};

export default LabPage;
