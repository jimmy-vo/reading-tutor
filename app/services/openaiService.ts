import { AzureOpenAI } from 'openai';

import { Env } from './configService';
const apiVersion = "2024-04-01-preview";

const chatClient = new AzureOpenAI({
  endpoint: Env.Llm.azureOpenaiChatEndpoint,
  apiKey: Env.Llm.azureOpenaiChatApiKey,
  deployment: Env.Llm.azureOpenaiChatDeployment,
  apiVersion: apiVersion
});

const imageClient = new AzureOpenAI({
  endpoint: Env.Disfusion.azureOpenaiImageEndpoint,
  apiKey: Env.Disfusion.azureOpenaiImageApiKey,
  deployment: Env.Disfusion.azureOpenaiImageDeployment,
  apiVersion: apiVersion
});

export const imageComplettion = async (prompt: string): Promise<string> => {
  const size = "1024x1024";
  const style = "natural";
  const quality = "standard";
  const n = 1;
  // Add response_format: 'b64_json'
  const results = await imageClient.images.generate({
    prompt,
    size,
    style,
    quality,
    n,
    response_format: 'b64_json'
  });
  // Get the base64 image from the response
  const base64Image = results.data[0].b64_json; // depends on API response structure
  return base64Image;
}

export const llmCompletion = async (prompt: string) => {
  const events = await chatClient.chat.completions.create({
    stream: false,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: Env.Llm.azureOpenaiChatDeployment,
    temperature: 0,
    top_p: 0.5
  });
  return events;
};
