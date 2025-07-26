import React, { useState, useEffect, Children, ReactNode } from 'react';
import styles from './PageAnimation.module.css';

const TURNING_DURATION: number = 800;

export namespace PageAnimationHelper {
  export const extractIdFromKey = (key: string) => {
    if (typeof key !== 'string') return undefined;
    const arr = key.split('page-');
    return arr.length === 2 ? arr[1] : undefined;
  };
  export const toKey = (id: string) => `page-${id}`;
}

// PageAnimation Component
export const PageAnimation = ({
  children,
  className,
  selectedId,
  onCurrentIdChanged,
}: {
  children?: ReactNode;
  className?: string;
  selectedId: string;
  onCurrentIdChanged: (id: string) => void;
}) => {
  // --- STATE MANAGEMENT ---
  const [pages, setPages] = useState([]);
  const [leftIdx, setLeftIdx] = useState(-1);
  const [animation, setAnimation] = useState({
    type: 'idle',
    duration: TURNING_DURATION,
  });

  // --- VALIDATION AND INITIALIZATION ---
  useEffect(() => {
    const childArray = Children.toArray(children);
    setPages(childArray);
    if (leftIdx !== -1) return;
    const initIdx = childArray.length - 2;
    setLeftIdx(initIdx);
    updateCurrentId(childArray[initIdx]['key'] as string);
  }, [children]);

  useEffect(() => {
    gotoPage();
  }, [selectedId, leftIdx]);

  const getselectedIdIdx = () =>
    pages.findIndex(
      (x) => PageAnimationHelper.extractIdFromKey(x.key) === selectedId,
    );

  const gotoPage = async () => {
    if (pages.length < 2) return;
    const targetIdx = getselectedIdIdx();
    if (targetIdx == -1 || targetIdx === leftIdx) return;
    const diff = Math.abs(targetIdx - leftIdx);
    const duration = 3000 / diff;
    if (targetIdx > leftIdx) {
      // console.debug('forward to', leftIdx, targetIdx);
      await turnPageForward(duration);
    } else if (targetIdx < leftIdx) {
      // console.debug('backward to', leftIdx, targetIdx);
      await turnPageBackward(duration);
    }
  };
  // --- PAGE ROLES ---
  // Define all pages involved in the current state and potential transitions
  const rightIdx = leftIdx + 1;

  // Pages currently visible in the 'idle' state
  const currentPageLeft = pages[leftIdx];
  const currentPageRight = pages[rightIdx];

  // Pages for turning forward
  const nextPageLeft = pages[rightIdx + 1]; // This is the back of currentPageRight
  const newRightPage = pages[rightIdx + 2]; // This is the page revealed after turning forward

  // Pages for turning backward
  const prevPageRight = pages[leftIdx - 1]; // This is the back of currentPageLeft
  const newLeftPage = pages[leftIdx - 2]; // This is the page revealed after turning backward

  // --- ANIMATION LOGIC ---
  const turnPageForward = async (
    duration: number = TURNING_DURATION,
  ): Promise<number> => {
    return turnPage(leftIdx + 2, 'turning-forward', duration);
  };

  const turnPageBackward = async (
    duration: number = TURNING_DURATION,
  ): Promise<number> => turnPage(leftIdx - 2, 'turning-backward', duration);

  const updateCurrentId = (key: string) => {
    const itemId = PageAnimationHelper.extractIdFromKey(key);
    if (itemId) {
      onCurrentIdChanged(itemId);
    }
  };
  const turnPage = async (
    index: number,
    type: string,
    duration: number,
  ): Promise<number> => {
    if (animation.type !== 'idle') return;
    if (index < 0 || index >= pages.length) return;
    console.log('turnning page ', `${index}/${pages.length}`);
    setAnimation({ ...animation, type: type, duration: duration });
    updateCurrentId(pages[index].key);
    await new Promise((resolve) => setTimeout(resolve, duration));
    setLeftIdx(index);
    setAnimation({ ...animation, type: 'idle', duration: duration });
    return index;
  };

  // --- STYLING ---
  const flipperStyle = {
    '--animation-duration': `${animation.duration}ms`,
  } as React.CSSProperties;

  console.log('PageAnimation');
  // --- RENDER ---
  return (
    <div className={`${styles['page-animation-wrapper']} ${className}`}>
      <div className={styles['page-animation-container']}>
        {/* --- The Book's "Base" --- */}
        {/* This layer holds the pages that are stationary or being revealed. */}
        <div className={styles.bookBase}>
          <PageWrapper className={styles.pageLeft}>
            {animation.type === 'turning-backward'
              ? newLeftPage
              : currentPageLeft || null}
          </PageWrapper>
          <PageWrapper className={styles.pageRight}>
            {animation.type === 'turning-forward'
              ? newRightPage
              : currentPageRight || null}
          </PageWrapper>
        </div>

        {/* --- The Animated Flipper Page (rendered on top) --- */}
        {animation.type !== 'idle' && (
          <div
            className={`${styles.pageFlipper} ${styles[animation.type]}`}
            style={flipperStyle}
          >
            {/* The side of the page facing the user at the start of the animation */}
            <div className={styles.pageFront}>
              <PageWrapper>
                {animation.type === 'turning-forward'
                  ? currentPageRight
                  : currentPageLeft}
              </PageWrapper>
            </div>
            {/* The side of the page that is revealed as it flips */}
            <div className={styles.pageBack}>
              <PageWrapper>
                {animation.type === 'turning-forward'
                  ? nextPageLeft
                  : prevPageRight}
              </PageWrapper>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrapper to ensure consistent styling and prevent prop conflicts
const PageWrapper = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => <div className={`${styles.page} ${className}`}>{children}</div>;
