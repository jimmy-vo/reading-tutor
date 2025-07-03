import axios from 'axios';
import { Content, EvaluationOutput } from '../models/dto';
import { Challenge, ContentSet } from '../models/view';
import { getHistoryFromStorage } from './history-service';

const fetchContent = async (topic: string): Promise<Content> => {
  let attempts = 0;
  const maxAttempts = 3;
  let contentResponse;

  while (attempts < maxAttempts) {
    try {
      contentResponse = await axios.post('/api/generateContent', { topic });
      return contentResponse.data as Content;
    } catch (error) {
      attempts++;
    }
  }

  throw new Error('Failed to fetch content after 3 attempts');
};


const fetchTopic = async (topics: string[]): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 3;
  let topicResponse;

  while (attempts < maxAttempts) {
    try {
      topicResponse = await axios.post('/api/generateTopic', topics);

      const newTopic = (topicResponse.data as { topic: string }).topic;
      return newTopic;

    } catch (error) {
      attempts++;
    }
  }

  throw new Error('Failed to fetch topic after 3 attempts');
};

export const verifyAnswers = async (contentSet: ContentSet): Promise<Challenge[]> => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await axios.post('/api/verifyAnswers', {
        text: contentSet.text,
        qna: contentSet.challenges.map(x => ({
          id: x.id,
          question: x.question,
          obtainedAnswer: x.answer,
          expectedAnswer: x.explaination,
        }))
      });
      return contentSet.challenges.map(x => {
        const entry = (response.data as EvaluationOutput[]).find(e => e.id === x.id)!
        x.correct = entry.correct;
        x.explaination = entry.suggestion;
        return x;
      })
    } catch (error) {
      console.error(error)
      attempt++;
    }
  }
  throw new Error('Failed to verify Answers after 3 attempts');
}


export const generateNewContent = async (): Promise<ContentSet> => {
  const topics = getHistoryFromStorage().map(x => x.topic);
  const topic = await fetchTopic(topics);

  const content = await fetchContent(topic);
  const contentSet: ContentSet = {
    topic: topic,
    text: content.text,
    challenges: content.qna.map(x => ({
      id: x.id,
      explaination: "",
      question: x.question,
      answer: "",
      expected: x.answer,
      correct: undefined,
    }))
  };

  localStorage.setItem('contentSet', JSON.stringify(contentSet));
  return contentSet;
}


export const getActiveContentStorage = async (): Promise<ContentSet> => {
  const cachedContentSetString = localStorage.getItem('contentSet');

  const cachedContentSet: ContentSet | null = cachedContentSetString ? JSON.parse(cachedContentSetString) : null;

  if (!cachedContentSet) return await generateNewContent();

  if (
    typeof cachedContentSet.topic === 'string' &&
    typeof cachedContentSet.text === 'string' &&
    Array.isArray(cachedContentSet.challenges) &&
    cachedContentSet.challenges.every(
      (qna: any) =>
        typeof qna.id === 'string' &&
        typeof qna.question === 'string' &&
        typeof qna.expected === 'string'
    )
  ) {
    return cachedContentSet;
  }

  return await generateNewContent();
}

export const removeActiveContentStorage = () => localStorage.removeItem('contentSet');


