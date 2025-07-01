import { createCompletion } from '../../utils/openaiClient';
import { NextApiRequest, NextApiResponse } from 'next';

import { Content } from '../../models/interfaces';

const example: Content = {
  text: "John went to school this morning, then he went home for lunch. After that he went back to school but he felt so bad. His mom kept him at home for the rest of the day",
  qna: [
    {
      id: "1",
      question: "When did John feel bad?",
      answer: "After lunch"
    }
  ]
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const { topic } = req.body;
    const topicRequirment = topic ? `The text must be follow the topic ${topic}` : "";
    const prompt = `${Date.now()}
Your task is to generate simple reading for grade 2 kid and a list of 5 open questions to verify his understanding.
for each question, generate expected answer and incremental id. 
${topicRequirment}
The OUTPUT must be in json format. For example:
OUTPUT:
\`\`\`json
${JSON.stringify(example, null, 0)}
\`\`\`

Now start generating paragraph and qna:
OUTPUT:
`;

    try {
      const completion = await createCompletion(prompt);
      const completionContent = completion.choices[0].message.content!.replace(/```json|```/g, '');
      const ressult = JSON.parse(completionContent);
      res.status(200).json(ressult);
    } catch (error) {
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
