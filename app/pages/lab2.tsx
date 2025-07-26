import React, { useState } from 'react';

/**
 * A reusable, controlled component for a tile that can zoom to fullscreen.
 * @param {object} props
 * @param {boolean} props.isZoomed - Whether the tile is currently in its fullscreen state.
 * @param {boolean} props.isDimmed - Whether the tile should be dimmed (e.g., when another tile is active).
 * @param {function} props.onZoomIn - Callback function to trigger the zoom-in animation.
 * @param {function} props.onZoomOut - Callback function to trigger the zoom-out animation.
 * @param {React.ReactNode} props.tileContent - The content to display when in the small tile state.
 * @param {React.ReactNode} props.fullscreenContent - The content to display when in the fullscreen state.
 * @param {object} props.tileStyle - Inline styles to control the tile's initial size and position.
 * @param {string} props.tileClassName - Additional CSS classes for the tile.
 */
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
        fixed z-20 
        ${tileClassName}
        transition-all duration-700 ease-in-out
        transform
        ${
          isZoomed
            ? 'w-full h-full top-0 left-0 rounded-none' // Fullscreen styles
            : 'rounded-2xl cursor-pointer shadow-2xl hover:shadow-purple-400/50' // Tile styles
        }
        ${
          isDimmed
            ? 'opacity-0 scale-90 pointer-events-none'
            : 'opacity-100 scale-100'
        }
    `;

  // The inline styles are applied directly. They control the animated properties:
  // top, left, width, and height.
  const dynamicStyle = isZoomed
    ? { top: '0%', left: '0%', width: '100%', height: '100%' }
    : tileStyle;

  // These classes control the opacity of the fullscreen content.
  const contentClasses = `
        transition-opacity duration-500
        ${isZoomed ? 'opacity-100 delay-500' : 'opacity-0 pointer-events-none'}
        w-full h-full flex flex-col items-center justify-center p-6
    `;

  return (
    <>
      {/* A static placeholder div to mark the tile's original spot. */}
      <div
        className={`fixed bg-gray-700/50 rounded-2xl transition-all duration-300 ${
          isZoomed || isDimmed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        style={tileStyle}
      ></div>

      {/* The actual Zoomable Component */}
      <div
        className={containerClasses}
        style={dynamicStyle}
        onClick={!isZoomed ? onZoomIn : undefined}
        aria-expanded={isZoomed}
        role="button"
        tabIndex={0}
      >
        {/* Fullscreen content, only visible when zoomed in. */}
        <div className={contentClasses}>
          <button
            onClick={handleZoomOut}
            className="absolute top-5 right-5 bg-white/20 text-white rounded-full p-3 hover:bg-white/30 transition-colors z-30"
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
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center font-sans overflow-hidden">
      {/* Background text that fades when a tile is zoomed */}
      <div
        className={`text-center text-gray-500 transition-opacity duration-500 ${
          zoomedTile ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Click a Tile Below
        </h1>
        <p>This demonstrates a reusable zoom component.</p>
      </div>

      {/* First Tile */}
      <ZoomableTile
        isZoomed={zoomedTile === 'tile1'}
        isDimmed={zoomedTile !== null && zoomedTile !== 'tile1'}
        onZoomIn={() => setZoomedTile('tile1')}
        onZoomOut={() => setZoomedTile(null)}
        tileStyle={tileStyle1}
        tileClassName="bg-gradient-to-br from-indigo-500 to-purple-600"
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
        tileClassName="bg-gradient-to-br from-teal-400 to-blue-500"
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
