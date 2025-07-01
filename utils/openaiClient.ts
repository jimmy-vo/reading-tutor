import { AzureOpenAI } from 'openai';

import { AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT } from './env';

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
    // max_tokens: 128,
    model: AZURE_OPENAI_DEPLOYMENT,
    temperature: 0,
    top_p: 0.5
  });
  return events;
};

export default client;
