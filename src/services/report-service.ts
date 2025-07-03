import { AnswerEvaluation, ContentSet, EvaluationInput, EvaluationOutput, ReadingReport } from '../models/view';
import axios from 'axios';

const REPORT_KEY = 'readingReports';

export const getReport = (): ReadingReport[] => {
    const reports = localStorage.getItem(REPORT_KEY);
    return reports ? JSON.parse(reports) : [];
};

export const addReport = (contentSet: ContentSet, evaluation: AnswerEvaluation[]): void => {
    const reports = getReport();
    const newReport: ReadingReport = {
        contentSet: contentSet,
        evaluation: evaluation
    };
    reports.push(newReport);
    localStorage.setItem(REPORT_KEY, JSON.stringify(reports));
};

export const verifyAnswers = async (evaluationInput: EvaluationInput): Promise<EvaluationOutput[]> => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const response = await axios.post('/api/verifyAnswers', evaluationInput);
            const value = (response.data as EvaluationOutput[]);
            return value;
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
