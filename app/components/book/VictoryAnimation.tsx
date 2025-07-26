import React, { useEffect } from 'react';
import styles from './VictoryAnimation.module.css';

const VictoryAnimation = ({
  onAnimationEnd,
  length,
}: {
  onAnimationEnd: () => void;
  length: number;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  const fireworks = Array.from({ length: length }, (_, i) => {
    // Random direction and distance for each firework
    const angle = Math.random() * 2 * Math.PI;
    const distance = 60 + Math.random() * 40; // px

    // Calculate translation
    const translateX = Math.round(Math.cos(angle) * distance);
    const translateY = Math.round(Math.sin(angle) * distance);

    // Random animation delay for effect
    const delay = Math.random() * 0.7; // seconds

    return {
      top: `${Math.round(Math.random() * 80) + 10}%`,
      left: `${Math.round(Math.random() * 80) + 10}%`,
      key: `firework-${i}`,
      style: {
        // CSS variables for animation direction and delay
        '--translate-x': `${translateX}px`,
        '--translate-y': `${-translateY}px`,
        animationDelay: `${delay}s`,
      } as React.CSSProperties,
    };
  });
  return (
    <div className={styles.overlay} aria-hidden="true">
      {fireworks.map((fw) => (
        <div
          key={fw.key}
          className={styles.firework}
          style={{ top: fw.top, left: fw.left, ...fw.style }}
        />
      ))}
    </div>
  );
};

export default VictoryAnimation;
