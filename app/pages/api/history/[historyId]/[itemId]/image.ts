import type { NextApiRequest, NextApiResponse } from 'next';

import fs from 'fs';
import { Env } from '../../../../../services/configService';
import path from 'path';
import { getItem } from '../../../../../services/historyRepository';

export interface GenerateImageOutput {
    id: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { historyId, itemId } = req.query as { historyId: string, itemId: string };
    if (req.method === 'GET') {
        const item = getItem(historyId, itemId);

        const imagePath = path.join(Env.imageStorage, historyId, "images", `${item.image}.png`);

        if (!fs.existsSync(imagePath)) {
            res.status(404).json({ error: 'Image not found' });
            return;
        }

        const image = fs.readFileSync(imagePath);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(image);
    }
    else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
