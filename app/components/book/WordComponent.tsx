import React from 'react';
import styles from './WordComponent.module.css';

interface WordComponentProps {
  word: string;
}

const WordComponent: React.FC<WordComponentProps> = ({ word }) => {
  const handleMouseOver = () => {
    const utterance = new SpeechSynthesisUtterance(word);
    window.speechSynthesis.speak(utterance);
    console.debug(`Hover on ${word}`);
  };

  return (
    <span className={styles.word} onDoubleClick={handleMouseOver}>
      {word}
    </span>
  );
};

export default WordComponent;
