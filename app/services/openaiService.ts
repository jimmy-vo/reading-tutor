import { AzureOpenAI } from 'openai';

import {
  AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_ENDPOINT,
  AZURE_OPENAI_DEPLOYMENT
} from './configService';

const client = new AzureOpenAI({
  endpoint: AZURE_OPENAI_ENDPOINT,
  apiKey: AZURE_OPENAI_API_KEY,
  deployment: AZURE_OPENAI_DEPLOYMENT,
});

export const createCompletion = async (prompt: string) => {
  const events = await client.chat.completions.create({
    stream: false,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: AZURE_OPENAI_DEPLOYMENT,
    temperature: 0,
    top_p: 0.5
  });
  return events;
};

