import { llmCompletion } from './openaiService';
import { Env } from './configService';
import { Grade } from '../models/backend/interface';

export async function generateTopic(grade: Grade, topics: string[]): Promise<string> {


    if (Env.Llm.mockedApi !== undefined) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return `Mock topic ${Date.now()}`;
    }

    const prompt = `${Date.now()}
Generate a NEW TOPIC from the following list of EXISTING TOPICS.
The NEW TOPIC must be limited to 10 of simple words and appropriate for kids and doesn't duplicate any of the EXISTING TOPICS. 
The NEW TOPIC can be What/Who/Where/When/Why or Yes/No question or a statement
The NEW TOPIC must folow format starting with 'NEW TOPIC:\n':
NEW TOPIC:\ntopic-content

NEW TOPIC AREAS: ${grade?.topics.join("; ")}
EXISTING TOPICS: ${JSON.stringify(topics.slice(-10), null, 0)}

NEW TOPIC:\n
`;
    const response = await llmCompletion(prompt);

    const rawTopic = response.choices[0]?.message?.content?.trim();
    const topic = rawTopic.startsWith('NEW TOPIC:') ? rawTopic.replace('NEW TOPIC:', '').trim() : rawTopic;

    if (!topic || topic === '') throw new Error("Failed to get topic");
    return topic;
}
