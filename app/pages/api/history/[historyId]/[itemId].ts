import type { NextApiRequest, NextApiResponse } from 'next';
import { readHistory, updateItem } from '../../../../services/historyRepository';
import { verifyAnswers } from '../../../../services/verifyAnswersService';
import { ContentSet } from '../../../../models/view/interface';
import { generateImage } from '../../../../services/generateImageService';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { historyId, itemId } = req.query as { historyId: string, itemId: string };

    switch (req.method) {
        case 'PATCH':
            try {
                const dto = req.body as ContentSet;
                const history = readHistory(historyId);
                const idx = history.findIndex(x => x.id === itemId);
                if (idx === -1 || dto.id !== itemId) {
                    res.status(404).json({ error: 'Item not found' });
                    break;
                }

                var item: ContentSet = dto;
                if (dto.challenges.every(x => x.correct === true)) {
                    item = await generateImage(historyId, dto);
                }
                else if (dto.challenges.every(x => x.correct === undefined)) {
                    const evaluation = await verifyAnswers(dto);
                    item.challenges = dto.challenges.map(x => {
                        const value = evaluation.find(e => e.id === x.id);
                        return ({ ...x, correct: value.correct, explaination: value.suggestion });
                    })
                }
                await updateItem(historyId, item);
                res.status(200).json(item);
            } catch (error) {
                console.error("Failed to verify answers:", error);
                res.status(500).json({ error: 'Failed to verify answers' });
            }
            break;
        default:
            res.status(405).json({ error: 'Method not allowed' });
            break;
    }
}


