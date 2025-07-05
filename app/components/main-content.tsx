import React, { useRef, useEffect, useState } from 'react';
import ContentContext from './content-context';
import ContentChallenges from './content-challenges';
import styles from './main-content.module.css';
import { ContentController } from './content-controller';
import { Challenge, ContentSet } from '../models/view';

interface ContentProps {
  className?: string;
  contentSet: ContentSet;
  isNextDisabled: boolean;
  onSubmit: (contentSet: ContentSet) => void;
  onNext: () => void;
}

const MainContent: React.FC<ContentProps> = ({
  contentSet,
  isNextDisabled,
  onSubmit,
  onNext,
  className,
}) => {
  const textContainerRef = useRef<HTMLDivElement>(null);
  const challengesContainerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  const [isSubmitDisabled, setSubmitDisabled] = useState(true);
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const flexDirection = window.getComputedStyle(
          entry.target,
        ).flexDirection;
        if (flexDirection === 'column' && textContainerRef.current) {
          textContainerRef.current.style.width = '';
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
  }, [contentSet, isNextDisabled]);

  const handleAnswerChanged = (value: Challenge[]) => {
    contentSet.challenges = value;
    setSubmitDisabled(
      contentSet.challenges.filter((x) => x.answer.trim().length > 0).length <
        contentSet.challenges.length,
    );
  };

  const handleSubmit = async () => {
    setSubmitDisabled(true);
    await onSubmit(contentSet);
  };

  return (
    <div className={`${styles.responsiveContainer} ${className}`}>
      <div ref={textContainerRef} className={styles.textContainer}>
        <ContentContext topic={contentSet.topic} text={contentSet.text} />
      </div>
      <div className={styles.divider} ref={dividerRef} />
      <div className={styles.challengesContainer} ref={challengesContainerRef}>
        <ContentChallenges
          onChanged={handleAnswerChanged}
          challenges={contentSet.challenges}
        />
        <ContentController
          className={styles.buttonContainer}
          onSubmit={handleSubmit}
          onNext={onNext}
          isSubmitDisabled={isSubmitDisabled}
          isNextDisabled={isNextDisabled}
        />
      </div>
    </div>
  );
};

export default MainContent;
