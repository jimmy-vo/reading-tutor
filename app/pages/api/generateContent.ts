import { createCompletion } from '../../services/openaiService';
import { NextApiRequest, NextApiResponse } from 'next';
import { Content, GenerateContentInput, } from '../../models/dto';
import { getGrade } from '../../services/gradeService';

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
    const { topic, level = 1 } = req.body as GenerateContentInput;
    const topicRequirment = topic ? `The text must be follow the topic ${topic}` : "";
    const grade = getGrade(level);

    if (grade === null) return res.status(400).json({ error: `Cannot get grade ${level}` });

    const prompt = `${Date.now()}
Your task is to generate simple reading passage for grade ${level} kid and a list of ${grade.questions} open questions to verify his understanding.
for each question, generate expected answer and incremental id. 
${topicRequirment}

PASSAGE REQUIREMENT: ${grade.passageFeatures.join("; ")}
QUESTION REQUIREMENT: ${grade.questionFeatures.join("; ")}

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
