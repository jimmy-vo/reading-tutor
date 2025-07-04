import { createCompletion } from '../../utils/openaiClient';
import { NextApiRequest, NextApiResponse } from 'next';
import { EvaluationInput, EvaluationOutput } from '../../models/dto';

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

Your task is to provide an EVALUATION of obtainedAnswer in JSON format to evaluate answers with the provided INPUT, which contains:
 - passage: A text given to a child to read and answer questions about.
 - qna: An array that includes:
   - id: A unique, incremental identifier for each question and answer set.
   - question: The question designed to assess understanding of the passage.
   - obtainedAnswer: The answer provided by the child.
   - expectedAnswer: Guidance for evaluating obtainedAnswer (which the child does not have access to).

An answer is incorrect if it is completely wrong, irrelevant to the question, or not supported by the passage.
An answer is correct if it demonstrates that the user understands the question and the given text, even if it is missing some details or contains grammatical errors.
It is important to encourage kids to read and learn, not just to spot what is wrong.

For example, if questionId1 has a perfect answer, questionId2's answer is incorrect, and questionId3’s answer is correct but could be improved grammatically:
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
