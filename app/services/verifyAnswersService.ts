import { llmCompletion } from './openaiService';
import { LlmEvaluation } from '../models/dtoInterface';
import { Env } from './configService';
import { ContentSet } from '../models/view/interface';

const mockedReturnValue = true;

const examples: LlmEvaluation[] = [
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

export const verifyAnswers = async (content: ContentSet): Promise<LlmEvaluation[]> => {
    if (Env.Llm.mockedApi !== undefined) {
        await new Promise(resolve => setTimeout(resolve, 50));
        content.challenges = content.challenges.map(x => ({
            ...x, correct: mockedReturnValue
        }));
        return content.challenges.map(x => ({
            id: x.id,
            correct: mockedReturnValue,
            suggestion: "mocked"
        }));
    }

    const input = {
        passage: content.passage,
        challenges: content.challenges.map(x => ({
            id: x.id,
            question: x.question,
            answer: x.answer,
            expected: x.expected
        }))
    }

    try {
        const prompt = `
${Date.now()}

Your task is to provide an EVALUATION of obtainedAnswer in JSON format to evaluate answers with the provided INPUT, which contains:
 - passage: A text given to a child to read and answer questions about.
 - challenges: An array that includes:
   - id: A unique, incremental identifier for each question and answer set.
   - question: The question designed to assess understanding of the passage.
   - answer: The answer provided by the child.
   - expected: Guidance for evaluating answer (which the child does not have access to).

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
        const completion = await llmCompletion(prompt);
        const completionContent = completion.choices[0].message.content!.replace(/```json|```/g, '');
        const verificationResults: LlmEvaluation[] = JSON.parse(completionContent);
        return verificationResults;
    } catch (error) {
        throw new Error((error as any).message);
    }
}
