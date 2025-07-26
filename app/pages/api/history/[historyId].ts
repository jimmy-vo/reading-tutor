import type { NextApiRequest, NextApiResponse } from 'next';
import { ReadingRepository } from '../../../services/historyRepository';
import { generateContent } from '../../../services/generateContentService';
import { generateTopic } from '../../../services/generateTopicService';
import { Util } from '../../../services/storageService';
import { ContentSet } from '../../../models/view/interface';
import { ConfigRepository } from '../../../services/configRepository';
import { retry } from '../../../helper/retry';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { historyId } = req.query as { historyId: string };
    switch (req.method) {
        case 'POST':
            try {
                const configs = ConfigRepository.getGrades();
                const history = ReadingRepository.readHistory(historyId);
                const gradeList = history.map(x => x.gradeId);
                // figure out the grade
                let gradeId = gradeList.length === 0

                    ? Math.min(...configs.grades.map(x => x.id))
                    : Math.max(...history.map(x => x.gradeId));
                let count = configs.grades.find(x => x.id === gradeId).count;
                const items = history
                    .filter(x => x.gradeId == gradeId)
                    .map(x => {
                        x.created = new Date(x.created);
                        return x;
                    })
                    .sort(
                        (a, b) => (b.created.getTime()) -
                            (a.created.getTime()));
                // no existing active
                const active = items.find(x => x.challenges.some(c => c.correct === undefined))
                if (active) {
                    res.status(400).json({ error: `${active.id} is still active` });
                }
                // check if needs upgrade
                for (let i = 0; i < items.length; i++) {
                    if (items[i].challenges.some(x => x.correct === false)) break;
                    if (count === 0) break;
                    count--;
                }

                if (count <= 0) {
                    gradeId += 1;
                }

                const grade = configs.grades.find(x => x.id === gradeId);
                if (grade === undefined) {
                    throw new Error(`Cannot get grade ${gradeId}`);
                }

                const topics = history.map(x => x.topic);
                const topic = await retry(async () => await generateTopic(grade, topics));
                const content = await retry(async () => await generateContent(topic, gradeId));
                const parsedContent: ContentSet = {
                    id: Util.getGuid(),
                    gradeId: gradeId,
                    topic: topic,
                    created: new Date(),
                    passage: content.passage,
                    challenges: content.qna.map(x => ({
                        id: x.id,
                        question: x.question,
                        expected: x.answer,
                        answer: '',
                        explaination: '',
                        correct: undefined,
                    }))
                };
                await ReadingRepository.addItem(historyId, parsedContent);
                res.status(200).json(parsedContent);
            } catch (error) {
                console.error("Failed to generate new item:", error);
                res.status(500).json({ error: 'Failed to generate new item' });
            }
            break;
        case 'GET':
            try {
                const history = ReadingRepository.readHistory(historyId);
                res.status(200).json(history);
            } catch (error) {
                console.error(error);
                res.status(400);
            }
            break;
        default:
            res.status(405).json({ error: 'Method not allowed' });
            break;
    }
}
