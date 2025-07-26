import React, { useState } from 'react';
import styles from './lab2.module.css';

const ZoomableTile = ({
  isZoomed,
  isDimmed,
  onZoomIn,
  onZoomOut,
  tileContent,
  fullscreenContent,
  tileStyle,
  tileClassName,
}) => {
  // This function stops the click from bubbling up to the container when exiting.
  const handleZoomOut = (e) => {
    e.stopPropagation();
    onZoomOut();
  };

  // We combine passed-in class names with the base classes.
  // The classes handle the transition, color, and shape.
  const containerClasses = `
        ${tileClassName}
        ${isZoomed ? 'zoomed' : 'tile'}
        ${isDimmed ? 'dimmed' : ''}
    `;

  // The inline styles are applied directly. They control the animated properties:
  // top, left, width, and height.
  const dynamicStyle = isZoomed
    ? { top: '0%', left: '0%', width: '100%', height: '100%' }
    : tileStyle;

  // These classes control the opacity of the fullscreen content.
  const contentClasses = `
        ${isZoomed ? 'fullscreen-content' : 'tile-content'}
    `;

  return (
    <>
      {/* A static placeholder div to mark the tile's original spot. */}
      <div
        className={`${styles.placeholder} ${
          isZoomed || isDimmed ? styles.hidden : ''
        }`}
        style={tileStyle}
      ></div>

      {/* The actual Zoomable Component */}
      <div
        className={`${styles.tile} ${containerClasses}`}
        style={dynamicStyle}
        onClick={!isZoomed ? onZoomIn : undefined}
        aria-expanded={isZoomed}
        role="button"
        tabIndex={0}
      >
        {/* Fullscreen content, only visible when zoomed in. */}
        <div className={`${styles.fullscreenContent} ${contentClasses}`}>
          <button
            onClick={handleZoomOut}
            className={styles.closeButton}
            aria-label="Close expanded view"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {fullscreenContent}
        </div>

        {/* Tile content, only visible when not zoomed. */}
        <div
          className={`transition-opacity duration-300 ${
            !isZoomed ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {tileContent}
        </div>
      </div>
    </>
  );
};

// This is the main App component that orchestrates the layout and state.
const App = () => {
  // We use state to track which tile is currently zoomed, if any.
  // It can be null, 'tile1', or 'tile2'.
  const [zoomedTile, setZoomedTile] = useState(null);

  // --- Configuration ---
  const TILE_SIZE_PX = 96; // Corresponds to w-24/h-24
  const MARGIN_PX = 32; // The space between the two tiles

  // We calculate the offset from the center for each tile.
  const offset = TILE_SIZE_PX / 2 + MARGIN_PX / 2;

  const tileBaseStyle = {
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: `${TILE_SIZE_PX}px`,
    height: `${TILE_SIZE_PX}px`,
  };

  const tileStyle1 = { ...tileBaseStyle, left: `calc(50% - ${offset}px)` };
  const tileStyle2 = { ...tileBaseStyle, left: `calc(50% + ${offset}px)` };

  return (
    <div className={styles.appContainer}>
      {/* Background text that fades when a tile is zoomed */}

      {/* First Tile */}
      <ZoomableTile
        isZoomed={zoomedTile === 'tile1'}
        isDimmed={zoomedTile !== null && zoomedTile !== 'tile1'}
        onZoomIn={() => setZoomedTile('tile1')}
        onZoomOut={() => setZoomedTile(null)}
        tileStyle={tileStyle1}
        tileClassName={styles.tile1}
        tileContent={
          <div className="w-full h-full flex items-center justify-center p-2 text-center">
            <p className="font-bold text-base">Profile</p>
          </div>
        }
        fullscreenContent={
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              User Profile
            </h1>
            <p className="text-lg max-w-2xl mx-auto">
              This is the expanded view for the first component.
            </p>
          </div>
        }
      />

      {/* Second Tile */}
      <ZoomableTile
        isZoomed={zoomedTile === 'tile2'}
        isDimmed={zoomedTile !== null && zoomedTile !== 'tile2'}
        onZoomIn={() => setZoomedTile('tile2')}
        onZoomOut={() => setZoomedTile(null)}
        tileStyle={tileStyle2}
        tileClassName={styles.tile2}
        tileContent={
          <div className="w-full h-full flex items-center justify-center p-2 text-center">
            <p className="font-bold text-base">Settings</p>
          </div>
        }
        fullscreenContent={
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Application Settings
            </h1>
            <p className="text-lg max-w-2xl mx-auto">
              This is the expanded view for the second component.
            </p>
          </div>
        }
      />
    </div>
  );
};

export default App;
