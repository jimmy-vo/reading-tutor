import { createCompletion } from '../../utils/openaiClient';
import { NextApiRequest, NextApiResponse } from 'next';
import { EvaluationInput, EvaluationOutput } from '../../models/interfaces';

const examples: EvaluationOutput[] = [
  {
    id: 'questionId1',
    suggestion: "",
    correct: true
  },
  {
    id: 'questionId2',
    suggestion: "why the answer is incorrect",
    correct: false
  },
  {
    id: 'questionId3',
    suggestion: "How the answer should look like",
    correct: true
  },
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const input: EvaluationInput = req.body as EvaluationInput;

    try {
      const prompt = `
${Date.now()}
Your task is to provide EVALUATION on obtained answers in json format to evaluate user answers with provided INPUT contains the text, qna including questionId, the obtained answer and the expected answer. 
An answer is correct when it indicates that the user understands the question and the given text. It doesn't have to be perfect or grammarly correct.
For example if questionId1 has perfect answer while questionId2's is incorrect and questionId3's is correct but can be grammarly improved:
EVALUATION: 
\`\`\`json
${JSON.stringify(examples, null, 0)}
\`\`\`

INPUT:
\`\`\`json
${JSON.stringify(input, null, 0)}
\`\`\`

EVALUATION:
`;

      const completion = await createCompletion(prompt);
      const completionContent = completion.choices[0].message.content!.replace(/```json|```/g, '');
      const verificationResults = JSON.parse(completionContent);
      res.status(200).json(verificationResults);
    } catch (error) {
      res.status(500).json({ error: (error as any).message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
