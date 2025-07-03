import React, { useRef, useEffect, useState } from 'react';
import styles from './main-content.module.css';
import { ContentSet } from '../models/view';

interface ContentProps {
  className?: string;
  contentSet: ContentSet;
  answers: {
    obtainedAnswer: string;
    correct?: boolean;
    suggestion?: string;
  }[];
  answerDisabled: boolean;
  submitDisabled: boolean;
  nextDisabled: boolean;
  onSubmit: () => void;
  onNext: () => void;
  onAnswersChanged: (index: number, value: string) => void;
}

const MainContent: React.FC<ContentProps> = ({
  contentSet,
  answers,
  answerDisabled,
  submitDisabled,
  nextDisabled,
  onSubmit,
  onNext,
  onAnswersChanged,
  className,
}) => {
  const textContainerRef = useRef<HTMLDivElement>(null);
  const qnaContainerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

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
      if (textContainerRef.current && qnaContainerRef.current) {
        const responsiveContainerWidth =
          textContainerRef.current.parentElement?.getBoundingClientRect()
            .width || 0;
        const maxWidth = responsiveContainerWidth - 100; // 30px margin on each side
        const newWidth = Math.min(
          e.clientX - textContainerRef.current.getBoundingClientRect().left,
          maxWidth,
        );
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
  }, []);

  return (
    <div className={`${styles.responsiveContainer} ${className}`}>
      <div className={styles.textContainer} ref={textContainerRef}>
        <p className={styles.title}> {contentSet.topic} </p>
        <p className={styles.paragraph}> {contentSet.content.text} </p>
      </div>
      <div className={styles.divider} ref={dividerRef} />
      <div className={styles.qnaContainer} ref={qnaContainerRef}>
        {contentSet.content.qna.map((qna, index) => (
          <div key={qna.id} className={styles.qnaItem}>
            <p className={styles.question}> {qna.question} </p>
            <input
              type="text"
              disabled={answerDisabled}
              value={answers[index]?.obtainedAnswer || ''}
              onChange={(e) => onAnswersChanged(index, e.target.value)}
              className={styles.input}
            />
            {answers[index]?.correct !== undefined && (
              <span>
                {answers[index].correct ? (
                  <span style={{ color: 'green' }}>✔️</span>
                ) : (
                  <span style={{ color: 'red' }}>❌</span>
                )}
              </span>
            )}
            <p style={{ color: 'blue' }}>{answers[index]?.suggestion || ' '}</p>
          </div>
        ))}

        <div className={styles.buttonContainer}>
          <button
            className={styles.button}
            onClick={onSubmit}
            disabled={submitDisabled}
          >
            Submit
          </button>

          <button
            className={styles.button}
            onClick={onNext}
            disabled={nextDisabled}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
