import ContentComponent from '../components/main-content';
import {
  verifyAnswers,
  resetScore,
  getScores,
} from '../services/score-service';
import Scores from '../components/scores';
import styles from './index.module.css';
import { useState, useEffect } from 'react';
import {
  generateNewContentSet,
  getContentSet,
  resetContent,
} from '../services/content-service';
import { ContentSet } from '../models/interfaces';

export interface Answer {
  id: string;
  expectedAnswer: string;
  obtainedAnswer: string;
}

export default function Home() {
  const [contentSet, setContentSet] = useState<ContentSet>();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isSubmitDisabled, setSubmitDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [localStorageReady, setLocalStorageReady] = useState(false);
  const [scores, setScores] = useState<{ total: number; correct: number }>({
    total: 0,
    correct: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      while (typeof window === 'undefined') {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      setLocalStorageReady(true);
      setScores(getScores);
      const newcontentSet = await getContentSet();
      setContentSet(newcontentSet);

      // while (!contentSet) {
      //   await new Promise((resolve) => setTimeout(resolve, 100));
      // }
      onContentSetUpdate(newcontentSet);
    };

    fetchData();
  }, []);

  const handleReset = async () => {
    setLoading(true);
    await resetContent();
    setScores(resetScore());
    await handleNewTopic();
  };
  const onContentSetUpdate = (contentSet: ContentSet) => {
    setLoading(false);
    setContentSet(contentSet);
    setAnswers(
      contentSet.content.qna.map((qna) => ({
        id: qna.id,
        obtainedAnswer: '',
        expectedAnswer: qna.answer,
      })),
    );
    setSubmitDisabled(true);
    setShowNextButton(false);
  };

  const handleNewTopic = async () => {
    setLoading(true);
    const contentSet = await generateNewContentSet();
    onContentSetUpdate(contentSet);
  };

  const handleAnswerChanged = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], obtainedAnswer: value };
    setAnswers(newAnswers);
    setSubmitDisabled(
      newAnswers.filter((answer) => answer.obtainedAnswer.trim().length > 0)
        .length < newAnswers.length,
    );
  };

  const handleSubmit = async () => {
    if (!contentSet) return;
    setSubmitDisabled(true);
    setLoading(true);
    const evaluationResult = await verifyAnswers({
      text: contentSet.content.text ?? '',
      qna: answers.map((answer) => ({
        id: answer.id,
        question:
          contentSet.content.qna.find((x) => x.id == answer.id)?.question ?? '',
        obtainedAnswer: answer.obtainedAnswer,
        expectedAnswer: answer.expectedAnswer,
      })),
    });
    setLoading(false);

    const updatedAnswers = answers.map((answer, index) => ({
      ...answer,
      correct: evaluationResult[index].correct,
      suggestion: evaluationResult[index].suggestion,
    }));
    setAnswers(updatedAnswers);
    setScores(getScores);
    setShowNextButton(true);
  };

  if (!contentSet) return <div>Loading...</div>;

  return (
    <div>
      {!localStorageReady || loading ? (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
        </div>
      ) : (
        <></>
      )}
      <div className={styles.container}>
        <Scores
          className={styles.scoreContainer}
          scores={scores}
          onResetTap={handleReset}
        />
        <ContentComponent
          className={styles.mainContainer}
          contentSet={contentSet}
          answers={answers}
          answerDisabled={showNextButton}
          submitDisabled={isSubmitDisabled}
          nextDisabled={!showNextButton}
          onAnswersChanged={handleAnswerChanged}
          onSubmit={handleSubmit}
          onNext={handleNewTopic}
        />
      </div>
    </div>
  );
}
