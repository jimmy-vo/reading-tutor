import type { NextApiRequest, NextApiResponse } from 'next';
import { readAllRewards, writeReward, deleteReward } from '../../../services/rewardRepository';
import { Reward } from '../../../models/backend/interface';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { historyId, rewardId } = req.query as { historyId: string, rewardId: string };

    switch (req.method) {
        case 'PATCH':
            try {
                const reward = req.body as Reward;
                const rewards = readAllRewards(historyId);
                const idx = rewards.findIndex(r => r.id === rewardId);
                if (idx === -1) {
                    res.status(404).json({ error: 'Reward not found' });
                    break;
                }
                writeReward(historyId, reward);
                res.status(200).json(reward);
            } catch (error) {
                console.error("Failed to update reward:", error);
                res.status(500).json({ error: 'Failed to update reward' });
            }
            break;
        case 'DELETE':
            try {
                deleteReward(historyId, rewardId);
                res.status(204).end();
            } catch (error) {
                console.error("Failed to delete reward:", error);
                res.status(500).json({ error: 'Failed to delete reward' });
            }
            break;
            res.status(405).json({ error: 'Method not allowed' });
            break;
    }
}
