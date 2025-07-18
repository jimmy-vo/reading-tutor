import React, { useRef, useEffect, useState } from 'react';
import PassageContainer from './PassageContainer';
import PassageChallenges from './PassageChallenges';
import styles from './ResponsiveMain.module.css';
import { ContentController } from './ChallengeButtons';
import { Challenge, ContentSet } from '../models/view/interface';

interface ResponsiveMainProps {
  className?: string;
  item: ContentSet;
  onSubmit: (contentSet: ContentSet) => void;
}

const ResponsiveMain: React.FC<ResponsiveMainProps> = ({
  item: contentSet,
  onSubmit,
  className,
}) => {
  const textContainerRef = useRef<HTMLDivElement>(null);
  const challengesContainerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  const [isSubmitDisabled, setSubmitDisabled] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const flexDirection = window.getComputedStyle(
          entry.target,
        ).flexDirection;
        if (flexDirection === 'column' && textContainerRef.current) {
          textContainerRef.current.style.width = '';
          textContainerRef.current.style.flex = '';
        } else if (textContainerRef.current) {
          textContainerRef.current.style.flex = '1';
        }
      }
    });

    if (textContainerRef.current && textContainerRef.current.parentElement) {
      observer.observe(textContainerRef.current.parentElement);
    }

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (textContainerRef.current && challengesContainerRef.current) {
        const responsiveContainerWidth =
          textContainerRef.current.parentElement?.getBoundingClientRect()
            .width || 0;

        const minWidth = responsiveContainerWidth / 4; // 30px margin on each side
        const maxWidth = minWidth * 3; // 30px margin on each side
        let newWidth =
          e.clientX - textContainerRef.current.getBoundingClientRect().left;

        if (newWidth < minWidth) {
          newWidth = minWidth;
        } else if (newWidth > maxWidth) {
          newWidth = maxWidth;
        }
        textContainerRef.current.style.width = `${newWidth}px`;
        textContainerRef.current.style.flex = `none`;
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    if (dividerRef.current) {
      dividerRef.current.addEventListener('mousedown', handleMouseDown);
    }

    return () => {
      if (textContainerRef.current && textContainerRef.current.parentElement) {
        observer.unobserve(textContainerRef.current.parentElement);
      }
      if (dividerRef.current) {
        dividerRef.current.removeEventListener('mousedown', handleMouseDown);
      }
    };
  }, [contentSet]);

  const handleAnswerChanged = (value: Challenge[]) => {
    contentSet.challenges = value;
    setSubmitDisabled(
      contentSet.challenges.filter((x) => x.answer.trim().length > 0).length <
        contentSet.challenges.length,
    );
  };

  const handleSubmit = async () => {
    setSubmitDisabled(true);
    setSubmitting(true);
    await onSubmit(contentSet);
    setSubmitting(false);
  };

  return (
    <div className={`${styles.responsiveContainer} ${className}`}>
      <div ref={textContainerRef} className={styles.textContainer}>
        <PassageContainer
          topic={contentSet.topic}
          imageId={contentSet.image}
          text={contentSet.text}
        />
      </div>
      <div className={styles.divider} ref={dividerRef} />
      <div className={styles.challengesContainer} ref={challengesContainerRef}>
        <PassageChallenges
          onChanged={handleAnswerChanged}
          challenges={contentSet.challenges}
          isSubmitting={isSubmitting}
        />
        <ContentController
          className={styles.buttonContainer}
          onSubmit={handleSubmit}
          isSubmitDisabled={isSubmitDisabled}
        />
      </div>
    </div>
  );
};

export default ResponsiveMain;
