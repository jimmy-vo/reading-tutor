import ContentComponent from '../components/main-content';
import {
  verifyAnswers,
  resetScore,
  getScores,
} from '../services/score-service';
import ControlButtons from '../components/control-buttons';
import styles from './index.module.css';
import { useState, useEffect } from 'react';
import {
  generateNewContentSet,
  resetContent,
} from '../services/content-service';
import { ContentSet, Scores } from '../models/interfaces';

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
  const [scores, setScores] = useState<Scores>({ total: 0, correct: 0 });

  useEffect(() => {
    const fetchData = async () => {
      while (typeof window === 'undefined') {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      setLocalStorageReady(true);
      setScores(getScores);
      setContentSet(await generateNewContentSet());

      while (!contentSet) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      setAnswers(
        contentSet!.content.qna.map(
          (qna: { id: string; question: string; answer: string }) => ({
            id: qna.id,
            obtainedAnswer: '',
            expectedAnswer: qna.answer,
          }),
        ),
      );
    };

    fetchData();
  }, []);

  const handleReset = async () => {
    setLoading(true);
    await resetContent();
    setScores(resetScore());
    await handleNewTopic();
  };

  const handleNewTopic = async () => {
    setLoading(true);
    const contentSet = await generateNewContentSet();
    setLoading(false);
    setContentSet(contentSet);
    setAnswers(
      contentSet.content.qna.map((qna) => ({
        id: qna.id,
        obtainedAnswer: '',
        expectedAnswer: qna.answer,
      })),
    );
    setSubmitDisabled(false);
    setShowNextButton(false);
  };

  const handleAnswerChanged = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], obtainedAnswer: value };
    setAnswers(newAnswers);
    setSubmitDisabled(
      !newAnswers.every((answer) => answer.obtainedAnswer.trim() !== ''),
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
        <span className={styles.correctAnswers}>
          Correct Answers: {scores.correct}/{scores.total}
        </span>
        <ControlButtons
          showNextButton={showNextButton}
          onNewTopicTap={handleNewTopic}
          onResetTap={handleReset}
        />
        <ContentComponent
          content={contentSet.content}
          answers={answers}
          disabled={showNextButton}
          onAnswersChanged={handleAnswerChanged}
        />
        <div className={styles.submitButtonContainer}>
          <button
            className={styles.button}
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
