import axios from 'axios';
import { Content, EvaluationOutput, GenerateContentInput, GenerateTopicInput } from '../models/dto';
import { Challenge, ContentSet } from '../models/view';

const ACTIVE_CONTENT_KEY = "content";


export namespace ContentStorage {
  export const read = (): ContentSet | null => {
    const contentSetString = localStorage.getItem(ACTIVE_CONTENT_KEY);
    const cachedContentSet: ContentSet | null = contentSetString ? JSON.parse(contentSetString) : null;
    return cachedContentSet;
  };

  export const write = (contentSet: ContentSet) => {
    localStorage.setItem(ACTIVE_CONTENT_KEY, JSON.stringify(contentSet));
  }
}

const fetchContent = async (topic: string, grade: number): Promise<Content> => {
  let attempts = 0;
  const maxAttempts = 3;
  let contentResponse;

  while (attempts < maxAttempts) {
    try {

      const dto: GenerateContentInput = {
        topic: topic,
        level: grade
      }
      contentResponse = await axios.post('/api/generateContent', dto);
      return contentResponse.data as Content;
    } catch (error) {
      attempts++;
    }
  }

  throw new Error('Failed to fetch content after 3 attempts');
};


const fetchTopic = async (topics: string[], grade: number): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 3;
  let topicResponse;

  while (attempts < maxAttempts) {
    try {
      const dto: GenerateTopicInput = {
        topics: topics,
        level: grade
      }
      topicResponse = await axios.post('/api/generateTopic', dto);

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


export const generateNewContent = async (history: ContentSet[], grade: number): Promise<ContentSet> => {
  const topics = history.map(x => x.topic);
  const topic = await fetchTopic(topics, grade);

  const content = await fetchContent(topic, grade);
  const contentSet: ContentSet = {
    topic: topic,
    grade: grade,
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

  ContentStorage.write(contentSet);
  return contentSet;
}


export const getActiveContentStorage = async (history: ContentSet[], grade: number): Promise<ContentSet> => {
  const cachedContentSet: ContentSet | null = ContentStorage.read();

  if (validateContent(cachedContentSet, grade)) return cachedContentSet!;
  return await generateNewContent(history, grade);
}

const validateContent = (cachedContentSet: ContentSet | null, grade: number) =>
  cachedContentSet &&
  cachedContentSet.grade === grade &&
  typeof cachedContentSet.topic === 'string' &&
  typeof cachedContentSet.text === 'string' &&
  Array.isArray(cachedContentSet.challenges) &&
  cachedContentSet.challenges.every(
    (qna: any) =>
      typeof qna.id === 'string' &&
      typeof qna.question === 'string' &&
      typeof qna.expected === 'string');
export const removeActiveContentStorage = () => localStorage.removeItem(ACTIVE_CONTENT_KEY);


