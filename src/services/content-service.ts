import axios from 'axios';
import { Content } from '../models/dto';
import { ContentSet } from '../models/view';


const storeTopicsInLocalStorage = (topics: string[]) => {
  localStorage.setItem('topics', JSON.stringify(topics));
};

const getTopicsFromLocalStorage = (): string[] => {
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


const getContentSet = async (): Promise<ContentSet> => {
  const cachedContentSetString = localStorage.getItem('contentSet');

  const cachedContentSet: ContentSet | null = cachedContentSetString ? JSON.parse(cachedContentSetString) : null;

  if (!cachedContentSet) return await generateNewContentSet();

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

  return await generateNewContentSet();
}

const resetContent = async () => {
  storeTopicsInLocalStorage([]);
}



export { getContentSet, generateNewContentSet, resetContent };
