import type { NextApiRequest, NextApiResponse } from 'next';
import { imageComplettion } from '../../services/openaiService';
import { v4 as uuidv4 } from 'uuid';
import { GenerateImageOutput } from '../../models/dto';
import fs from 'fs';
import { Env } from '../../services/configService';
import path from 'path';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== 'string') {
            res.status(400).json({ error: 'Invalid prompt' });
            return;
        }
        if (Env.mockedApi) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return res.status(200).json({ id: "mocked-id" } as GenerateImageOutput);
        }
        try {
            const base64Image = await imageComplettion(prompt);
            const buffer = Buffer.from(base64Image, 'base64');
            const imageId = uuidv4();
            const imagePath = path.join(Env.imageStorage, `${imageId}.png`);
            fs.writeFileSync(imagePath, buffer);
            const data: GenerateImageOutput = { id: imageId }
            res.status(200).json(data);
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
