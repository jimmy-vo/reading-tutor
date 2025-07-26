import type { NextApiRequest, NextApiResponse } from 'next';
import { readAllRewards, writeReward } from '../../services/rewardRepository';
import { Reward } from '../../models/backend/interface';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { historyId } = req.query as { historyId: string };

    switch (req.method) {
        case 'GET':
            try {
                const rewards = readAllRewards(historyId);
                res.status(200).json(rewards);
            } catch (error) {
                console.error("Failed to read rewards:", error);
                res.status(500).json({ error: 'Failed to read rewards' });
            }
            break;
        case 'POST':
            try {
                const reward = req.body as Reward;
                writeReward(historyId, reward);
                res.status(201).json(reward);
            } catch (error) {
                console.error("Failed to write reward:", error);
                res.status(500).json({ error: 'Failed to write reward' });
            }
            break;
        default:
            res.status(405).json({ error: 'Method not allowed' });
            break;
    }
}
