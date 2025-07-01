import React from 'react';
import styles from './404.module.css';

const Custom404 = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>404 - Page Not Found</h1>
      <p className={styles.p}>Sorry, an error occurred while prerendering this page.</p>
      <p className={styles.p}>Please try again later or contact support.</p>
    </div>
  );
};

export default Custom404;
