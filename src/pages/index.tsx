import ContentComponent from '../components/main-content';
import { getReport, verifyAnswers } from '../services/report-service';
import styles from './index.module.css';
import { useState, useEffect } from 'react';
import {
  generateNewContentSet,
  getContentSet,
  resetContent,
} from '../services/content-service';
import { ContentSet } from '../models/view';
import { addReport, resetReport } from '../services/report-service';
import ReadingReports from '../components/reading-report';
import { ReadingReport } from '../models/view';

export interface Answer {
  id: string;
  expectedAnswer: string;
  obtainedAnswer: string;
}

export default function Home() {
  const [reports, setReports] = useState<ReadingReport[]>([]);
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
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      while (typeof window === 'undefined') {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      setLocalStorageReady(true);
      const newcontentSet = await getContentSet();
      setContentSet(newcontentSet);
      onContentSetUpdate(newcontentSet);

      const reportData = await getReport();
      setReports(reportData);
    };

    fetchData();
  }, []);

  const handleReset = async () => {
    setLoading(true);
    await resetContent();
    resetReport();
    setReports([]);
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
    setShowNextButton(true);
    addReport(
      contentSet,
      updatedAnswers.map((x) => ({
        id: x.id,
        suggestion: x.suggestion,
        answer: x.obtainedAnswer,
        correct: x.correct,
      })),
    );
    setReports(await getReport());
  };

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  const handleSelect = (topic: string) => {
    console.log(`Selected topic: ${topic}`);
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
        <button className={styles.hamburgerButton} onClick={toggleDrawer}>
          ☰
        </button>
        <div
          className={`${styles.drawer} ${
            isDrawerOpen ? styles.drawerOpen : ''
          }`}
        >
          <ReadingReports
            onSelect={handleSelect}
            onResetTap={handleReset}
            reports={reports}
          />
        </div>
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
