import { EvaluationOutput } from '../models/dto';
import { Challenge, ContentSet } from '../models/view';
import axios from 'axios';

const REPORT_KEY = 'list';

export const getReport = (): ContentSet[] => {
    const reports = localStorage.getItem(REPORT_KEY);
    return reports ? JSON.parse(reports) : [];
};

export const addReport = (contentSet: ContentSet): void => {
    const reports = getReport();
    reports.unshift(contentSet);
    localStorage.setItem(REPORT_KEY, JSON.stringify(reports));
};

export const verifyAnswers = async (contentSet: ContentSet): Promise<Challenge[]> => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const response = await axios.post('/api/verifyAnswers', {
                text: contentSet.text,
                qna: contentSet.challenges.map(x => ({
                    id: x.id,
                    question: x.question,
                    obtainedAnswer: x.answer,
                    expectedAnswer: x.explaination,
                }))
            });
            return contentSet.challenges.map(x => {
                const entry = (response.data as EvaluationOutput[]).find(e => e.id === x.id)!
                x.correct = entry.correct;
                x.explaination = entry.suggestion;
                return x;
            })
        } catch (error) {
            console.error(error)
            attempt++;
        }
    }
    throw new Error('Failed to verify Answers after 3 attempts');
}

export const resetReport = (): void => {
    localStorage.removeItem(REPORT_KEY);
};
