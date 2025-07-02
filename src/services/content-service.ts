import axios from 'axios';
import { Content, ContentSet } from '../models/interfaces';


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

const generateNewContentSet = async (): Promise<ContentSet> => {
  const topics = getTopicsFromLocalStorage();
  const topic = await fetchTopic(topics);
  addTopicToLocalStorage(topic);

  const content = await fetchContent(topic);
  return {
    content: content,
    topic: topic,
  };
}

const resetContent = async () => {
  storeTopicsInLocalStorage([]);
}



export { generateNewContentSet, resetContent };
