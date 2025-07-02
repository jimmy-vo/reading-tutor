import type { NextApiRequest, NextApiResponse } from 'next';
import { createCompletion } from '../../utils/openaiClient';

type Data = {
    topic?: string;
    error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    if (req.method === 'POST') {
        const topics: string[] = req.body as string[];

        if (!topics || !Array.isArray(topics)) {
            res.status(400).json({ error: 'Invalid topics list' });
            return;
        }

        try {
            const prompt = `${Date.now()}
Generate a NEW TOPIC from the following list of EXISTING TOPICS. 
The NEW TOPIC must be limited to 10 of simple words and appropriate for kids and doesn't duplicate any of the EXISTING TOPICS. 
The NEW TOPIC must folow format:
NEW TOPIC:\ntopic-content

EXISTING TOPICS: ${JSON.stringify(topics, null, 0)}

NEW TOPIC:\n
`;
            const response = await createCompletion(prompt);

            const rawTopic = response.choices[0]?.message?.content?.trim() || 'No topic available';
            const topic = rawTopic.startsWith('NEW TOPIC:') ? rawTopic.replace('NEW TOPIC:', '').trim() : rawTopic;
            res.status(200).json({ topic });
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate topic' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
