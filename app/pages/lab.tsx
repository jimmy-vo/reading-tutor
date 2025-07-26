import React from 'react';
import ReadingBook from '../components/book/ReadingBook';
import styles from './lab.module.css';
import RewardDashboard from '../components/reward/RewardDashboard';

const LabPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.componentWrapper}>
        <RewardDashboard />
      </div>
      <div className={styles.componentWrapper}>
        <ReadingBook />
      </div>
    </div>
  );
};

export default LabPage;
