import type { NextApiRequest, NextApiResponse } from 'next';
import { imageComplettion, llmCompletion } from '../../services/openaiService';
import { v4 as uuidv4 } from 'uuid';
import { GenerateImageOutput, Content } from '../../models/dto';
import fs from 'fs';
import { Env } from '../../services/configService';
import path from 'path';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        const dto: Content = req.body as Content
        try {
            const imageOutput = await generateImage(dto);
            res.status(200).json(imageOutput);
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

async function generateImageDescriptionPrompt(content: Content): Promise<string | null> {
    const prompt = `${Date.now()}
Your task is to generate a description in plain text for an PASSAGE inllustration within 5 sentences. 
Look at the qna to describe the main subject of the image, then analyze the passage to describe background.
The image must illustrate the passage and focus on what being asked.

PASSAGE: ${content.text}
QNA: ${JSON.stringify(content.qna.map(x => ({ question: x.question, answer: x.answer })), null, 0)}
`;
    const response = await llmCompletion(prompt);
    return response.choices[0]?.message?.content?.trim() ?? null;
}

async function generateImage(content: Content): Promise<GenerateImageOutput> {
    let description = '';
    for (let i = 0; i < 3; i++) {
        description = await generateImageDescriptionPrompt(content);
        if (description !== null) break;
    }
    if (!description) throw new Error('Failed to generate image description after 3 attempts');

    if (Env.Disfusion.mockedApi !== undefined) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (!Env.Disfusion.mockedApi) throw new Error();

        return { id: "mocked-id" };

    }
    const base64Image = await imageComplettion(description);
    const buffer = Buffer.from(base64Image, 'base64');
    const imageId = uuidv4();
    const imagePath = path.join(Env.imageStorage, `${imageId}.png`);
    fs.writeFileSync(imagePath, buffer);
    return { id: imageId };
}
