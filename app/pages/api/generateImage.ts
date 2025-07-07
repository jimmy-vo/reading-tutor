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
        const { prompt } = req.body;
        try {
            const imageOutput = await generateImage(prompt);
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

async function generateImage(prompt: string): Promise<GenerateImageOutput> {

    if (Env.Disfusion.mockedApi !== undefined) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!Env.Disfusion.mockedApi) throw new Error();

        return { id: "mocked-id" };

    }
    const base64Image = await imageComplettion(prompt);
    const buffer = Buffer.from(base64Image, 'base64');
    const imageId = uuidv4();
    const imagePath = path.join(Env.imageStorage, `${imageId}.png`);
    fs.writeFileSync(imagePath, buffer);
    return { id: imageId };
}
