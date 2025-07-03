import React from 'react';
import styles from './content-context.module.css';

interface ContentContextProps {
  topic: string;
  text: string;
}

const ContentContext: React.FC<ContentContextProps> = ({ topic, text }) => {
  return (
    <div>
      <p className={styles.title}> {topic} </p>
      <p className={styles.paragraph}> {text} </p>
    </div>
  );
};

export default ContentContext;
