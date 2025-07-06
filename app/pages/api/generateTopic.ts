import type { NextApiRequest, NextApiResponse } from 'next';
import { llmCompletion } from '../../services/openaiService';
import { GenerateTopicInput } from '../../models/dto';
import { Config, Env } from '../../services/configService';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        const { topics, level = 1 } = req.body as GenerateTopicInput;

        if (!topics || !Array.isArray(topics)) {
            res.status(400).json({ error: 'Invalid topics list' });
            return;
        }
        const grade = Config.getGrade(level);
        if (grade === null) return res.status(400).json({ error: `Cannot get grade ${level}` });

        if (Env.Llm.mockedApi !== undefined) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return res.status(200).json({ topic: "Play in the garden" });
        }

        try {
            const prompt = `${Date.now()}
Generate a NEW TOPIC from the following list of EXISTING TOPICS.
The NEW TOPIC must be limited to 10 of simple words and appropriate for kids and doesn't duplicate any of the EXISTING TOPICS. 

NEW TOPIC AREAS: ${grade?.topics.join("; ")}
The NEW TOPIC must folow format starting with 'NEW TOPIC:\n':
NEW TOPIC:\ntopic-content

EXISTING TOPICS: ${JSON.stringify(topics, null, 0)}

NEW TOPIC:\n
`;
            const response = await llmCompletion(prompt);

            const rawTopic = response.choices[0]?.message?.content?.trim() || 'No topic available';
            const topic = rawTopic.startsWith('NEW TOPIC:') ? rawTopic.replace('NEW TOPIC:', '').trim() : rawTopic;
            res.status(200).json({ topic });
        } catch (error) {
            console.error(error)
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'An unknown error occurred' });
            }
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
