import ContentComponent from '../components/main-content';
import ControlButtons from '../components/control-buttons';
import styles from '../index.module.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Content,
  EvaluationInput,
  EvaluationOutput,
} from '../models/interfaces';

export interface Answer {
  id: string;
  expectedAnswer: string;
  obtainedAnswer: string;
}

const fetchTopic = async (): Promise<string> => {
  const topics = getTopicsFromLocalStorage();
  const topicResponse = await axios.post('/api/generateTopic', topics);
  const newTopic = (topicResponse.data as { topic: string }).topic;
  addTopicToLocalStorage(newTopic);
  return newTopic;
};
const storeTopicsInLocalStorage = (topics: string[]) => {
  if (typeof window === 'undefined') return;

  localStorage.setItem('topics', JSON.stringify(topics));
};

const getTopicsFromLocalStorage = (): string[] => {
  if (typeof window === 'undefined') return [];

  const topics = localStorage.getItem('topics');
  return topics ? JSON.parse(topics) : [];
};
const addTopicToLocalStorage = (topic: string) => {
  const topics = getTopicsFromLocalStorage();
  topics.push(topic);
  storeTopicsInLocalStorage(topics);
};

export default function Home() {
  const [content, setContent] = useState<Content | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [topic, setTopic] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluationOutput[] | null>(null);
  const [allAnswersFilled, setAllAnswersFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [localStorageReady, setLocalStorageReady] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
  const fetchData = async () => {
    if (typeof window === 'undefined') return;

    const storedCorrectAnswers = localStorage.getItem('correctAnswers');
    setCorrectAnswers(
      storedCorrectAnswers ? parseInt(storedCorrectAnswers, 10) : 0,
    );

    const storedTotalQuestions = localStorage.getItem('totalQuestions');
    setTotalQuestions(
      storedTotalQuestions ? parseInt(storedTotalQuestions, 10) : 0,
    );
    setLocalStorageReady(true);
      const newTopic = await fetchTopic();
      setTopic(newTopic);
      const contentResponse = await axios.post('/api/generateContent', {
        topic: newTopic,
      });
      setContent(contentResponse.data as Content);
      setAnswers(
        (contentResponse.data as Content).qna.map((qna) => ({
          id: qna.id,
          obtainedAnswer: '',
          expectedAnswer: qna.answer,
        })),
      );
    };

    fetchData();
  }, []);

  const handleReset = async () => {
    setLoading(true);
    if (typeof window === 'undefined') return;

    await fetchTopic();

    setCorrectAnswers(0);
    setTotalQuestions(0);
    localStorage.removeItem('topics');
    localStorage.removeItem('correctAnswers');
    localStorage.removeItem('totalQuestions');
    const contentResponse = await axios.post('/api/generateContent', {
      topic: topic,
    });
    setContent(contentResponse.data as Content);
    setAnswers(
      (contentResponse.data as Content).qna.map((qna) => ({
        id: qna.id,
        question: qna.question,
        obtainedAnswer: '',
        expectedAnswer: qna.answer,
      })),
    );
    setLoading(false);
  };

  const handleNewTopic = async () => {
    setLoading(true);
    await fetchTopic();

    const contentResponse = await axios.post('/api/generateContent', {
      topic: topic,
    });
    setAnswers(
      (contentResponse.data as Content).qna.map((qna) => ({
        id: qna.id,
        obtainedAnswer: '',
        expectedAnswer: qna.answer,
      })),
    );
    setContent(contentResponse.data as Content);
    setLoading(false);
  };

  const handleAnswerChanged = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], obtainedAnswer: value };
    setAnswers(newAnswers);
    setAllAnswersFilled(
      newAnswers.every((answer) => answer.obtainedAnswer.trim() !== ''),
    );
  };

  const handleSubmit = async () => {
    if (typeof window === 'undefined') return;

    const evaluationInput: EvaluationInput = {
      text: content?.text ?? '',
      qna: answers.map((answer) => ({
        id: answer.id,
        question: content?.qna.find((x) => x.id == answer.id)?.question ?? '',
        obtainedAnswer: answer.obtainedAnswer,
        expectedAnswer: answer.expectedAnswer,
      })),
    };
    const response = await axios.post('/api/verifyAnswers', evaluationInput);
    const evaluationResult = response.data as EvaluationOutput[];

    setCorrectAnswers(
      correctAnswers + evaluationResult.filter((x) => x.correct).length,
    );
    localStorage.setItem('correctAnswers', correctAnswers.toString());

    setTotalQuestions(totalQuestions + answers.length);
    localStorage.setItem('totalQuestions', totalQuestions.toString());

    setAllAnswersFilled(false);
    const updatedAnswers = answers.map((answer, index) => ({
      ...answer,
      correct: evaluationResult[index].correct,
      suggestion: evaluationResult[index].suggestion,
    }));
    setAnswers(updatedAnswers);
    setResult(evaluationResult);
    setShowNextButton(true);
  };

  if (!content) return <div>Loading...</div>;

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
          Correct Answers: {correctAnswers}/{totalQuestions}
        </span>
        <ControlButtons
          showNextButton={showNextButton}
          onNewTopicTap={handleNewTopic}
          onResetTap={handleReset}
        />
        <ContentComponent
          content={content}
          answers={answers}
          onAnswersChanged={handleAnswerChanged}
        />
        <div className={styles.submitButtonContainer}>
          <button
            className={styles.button}
            onClick={handleSubmit}
            disabled={!allAnswersFilled}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
