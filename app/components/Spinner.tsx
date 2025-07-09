import React from 'react';
import styles from './Spinner.module.css';

const Spinner = ({ size = 120 }) => {
  const borderWidth = size / 5;
  const innerSized = size - borderWidth * 2;
  return (
    <div style={{ width: size, height: size }}>
      <div
        className={styles.loadingSpinner}
        style={{
          borderWidth: borderWidth,
          width: innerSized,
          height: innerSized,
        }}
      />
    </div>
  );
};

export default Spinner;
