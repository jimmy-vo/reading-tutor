import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Env } from '../../../services/configService';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid image id' });
        return;
    }

    const imagePath = path.join(Env.imageStorage, `${id}.png`);

    if (!fs.existsSync(imagePath)) {
        res.status(404).json({ error: 'Image not found' });
        return;
    }

    const image = fs.readFileSync(imagePath);
    res.setHeader('Content-Type', 'image/png');
    res.send(image);
}
