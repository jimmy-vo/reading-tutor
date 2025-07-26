import React from 'react';
import styles from './Spinner.module.css';

const Spinner = ({ size = 120, className = '' }) => {
  const borderWidth = size / 5;
  const innerSized = size - borderWidth * 2;
  return (
    <div style={{ width: size, height: size }} className={className}>
      <div
        className={[styles.loadingSpinner].join(' ')}
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
