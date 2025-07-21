import { llmCompletion } from '../../services/openaiService';
import { NextApiRequest, NextApiResponse } from 'next';
import { Content, GenerateContentInput, } from '../../models/dtoInterface';
import { Env } from '../../services/configService';
import { Grade } from '../../models/backend/interface';
const mockedExample: Content = {
  passage: "John went to school early in the morning, looking forward to his favorite math class. He met his friend Lisa at the school gate, and they walked together through the long corridor. During the first period, John excelled in a surprise quiz and earned praise from his teacher, Mrs. Carter. At recess, he played soccer with his classmates and scored the winning goal. As the bell rang for lunch, John felt hungry and hurried home, where his mom had prepared his favorite spaghetti. After lunch, John felt a sudden headache and became dizzy. His mom checked his temperature and noticed he had a mild fever. She gave him some medicine and decided to keep him at home for the rest of the day, canceling his afternoon return to school. John rested in his room and read his favorite adventure book. Later, Lisa called to ask how he was doing and promised to share notes from the missed classes. By evening, John's fever went down, and his mom made him some soup. John promised to take better care of himself and thanked his mom for her help.",
  qna: [
    { id: "1", question: "What subject was John looking forward to?", answer: "Math" },
    { id: "2", question: "Who did John meet at the school gate?", answer: "Lisa" },
    { id: "3", question: "Through what did John and Lisa walk?", answer: "The long corridor" },
    { id: "4", question: "What did John excel at during the first period?", answer: "A surprise quiz" },
    { id: "5", question: "Who praised John for his performance?", answer: "Mrs. Carter" },
    { id: "6", question: "What game did John play at recess?", answer: "Soccer" },
    { id: "7", question: "What did John do during the soccer game?", answer: "Scored the winning goal" },
    { id: "8", question: "Why did John hurry home at lunch?", answer: "He felt hungry" },
    { id: "9", question: "What meal did John's mom prepare for lunch?", answer: "Spaghetti" },
  ]
}
const example: Content = {
  passage: "John went to school this morning, then he went home for lunch. After that he went back to school but he felt so bad. His mom kept him at home for the rest of the day",
  qna: [
    {
      id: "1",
      question: "When did John feel bad?",
      answer: "After lunch"
    },
    {
      id: "2",
      question: "Who kept him at home?",
      answer: "His mom"
    }
  ]
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const { topic, level = 1 } = req.body as GenerateContentInput;
    if (Env.Llm.mockedApi !== undefined) {
      await new Promise(resolve => setTimeout(resolve, 50));
      // res.status(200).json({ ...mockedExample, passage: mockedExample.passage + " " + mockedExample.passage });
      res.status(200).json(example);
    }
    const grade = Env.grades.find(grade => grade.id === level);

    if (grade === undefined) return res.status(400).json({ error: `Cannot get grade ${level}` });

    const previousGrade: Grade | undefined = Env.grades.find(grade => grade.id === level - 1);
    const nextGrade: Grade | undefined = Env.grades.find(grade => grade.id === level + 1);

    const previousGradeRequirement = previousGrade === undefined
      ? ""
      : [`## GRADE ${previousGrade.id}'s REQUIREMENT, which is already achieved:`,
      `PASSAGE: ${previousGrade.passageFeatures.join("; ")}`,
      `QUESTIONS: ${previousGrade.questionFeatures.join("; ")}`].join("\n")

    const currentGradeRequirement =
      [`## GRADE ${grade.id}'s REQUIREMENT, which should be focused at this moment:`,
      `PASSAGE: ${grade.passageFeatures.join("; ")}`,
      `QUESTIONS: ${grade.questionFeatures.join("; ")}`].join("\n")

    const nextGradeRequirement = nextGrade === undefined
      ? ""
      : [`## GRADE ${nextGrade.id}'s REQUIREMENT, which we are trying to prepare the kid for:`,
      `PASSAGE: ${nextGrade.passageFeatures.join("; ")}`,
      `QUESTIONS: ${nextGrade.questionFeatures.join("; ")}`].join("\n")

    const prompt = `${Date.now()}
Your task is to generate reading passage for grade-${level} kid and a list of ${grade.questions} open questions to verify their understanding with the REQUIREMENTS below.

The OUTPUT must be in json format with incremental id in each qna's element. For example:
OUTPUT:
\`\`\`json
${JSON.stringify(example, null, 0)}
\`\`\`

# Below is ${[previousGrade, nextGrade].filter(x => x !== undefined).map(x => `GRADE-${x.id} REQUIREMENT`).join(" and ")} to show where the grade-${level} kid is, to make sure your output is appropriate to GRADE-${level}'s REQUIREMENT:
${previousGradeRequirement}
${nextGradeRequirement}

# However, Your task out put will focus on the GRADE-${level}'s REQUIREMENT below:
${currentGradeRequirement}

Now start generating OUTPUT, using the topic "${topic}":
OUTPUT:
`;

    try {
      const completion = await llmCompletion(prompt);
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
