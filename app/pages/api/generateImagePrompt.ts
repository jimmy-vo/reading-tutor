import type { NextApiRequest, NextApiResponse } from 'next';
import { llmCompletion } from '../../services/openaiService';
import { ImagePromptInput } from '../../models/dto';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        const dto: ImagePromptInput = req.body as ImagePromptInput;
        try {
            const prompt = await generateImageDescriptionPrompt(dto);
            res.status(200).json({ prompt });
        } catch (error) {
            console.error(error);
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

async function generateImageDescriptionPrompt(dto: ImagePromptInput): Promise<string | null> {
    const previousAttemptString: string = dto.previousAttempts.length === 0
        ? ""
        : `PREVIOUS ATTEMPTS failed due to content filter. Try to rephrase or come up with a safer description.
PREVIOUS ATTEMPTS: ${JSON.stringify(dto.previousAttempts, null, 0)}
`;

    const prompt = `${Date.now()}
Your task is to generate an IMAGE DESCRIPTION in plain text for an PASSAGE inllustration within 4 sentences. 
Look at the qna to describe the main subject of the image, then analyze the passage to describe background.
The image must illustrate the passage and focus on what being asked.
The IMAGE DESCRIPTION doesn't mention the instruction above or this task's requirement. And must be understandable without PASSAGE or QNA.
PASSAGE: ${dto.passage}
QNA: ${JSON.stringify(dto.qna.map(x => ({ question: x.question, answer: x.answer })), null, 0)}
${previousAttemptString}
IMAGE DESCRIPTION:
`;
    const response = await llmCompletion(prompt);
    return response.choices[0]?.message?.content?.trim() ?? null;
}
