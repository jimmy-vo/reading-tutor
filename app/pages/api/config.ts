import { NextApiRequest, NextApiResponse } from 'next';
import { ConfigRepository } from '../../services/configRepository';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const grades = ConfigRepository.getGrades();
        res.status(200).json(grades);
    } else {
        res.status(405).end(); // Method Not Allowed
    }
}
