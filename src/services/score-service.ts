import axios from 'axios';
import { EvaluationInput, EvaluationOutput, Scores } from '../models/interfaces';

export const verifyAnswers = async (evaluationInput: EvaluationInput): Promise<EvaluationOutput[]> => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const response = await axios.post('/api/verifyAnswers', evaluationInput);
            const value = (response.data as EvaluationOutput[]);
            addScores({
                total: value.length,
                correct: value.filter((x) => x.correct).length
            })
            return value;
        } catch (error) {
            attempt++;
        }
    }
    throw new Error('Failed to fetch topic after 3 attempts');
}

const addScores = (newScores: Scores): void => {
    const currentScores = getScores();
    const finalScores: Scores = {
        total: currentScores.total + newScores.total,
        correct: currentScores.correct + newScores.correct
    }
    localStorage.setItem('correctAnswers', finalScores.correct.toString());
    localStorage.setItem('totalQuestions', finalScores.total.toString());
}

export const getScores = (): Scores => {
    const storedCorrectAnswers = localStorage.getItem('correctAnswers');
    const storedTotalQuestions = localStorage.getItem('totalQuestions');
    return {
        total: storedTotalQuestions ? parseInt(storedTotalQuestions || '0', 0) : 0,
        correct: storedCorrectAnswers ? parseInt(storedCorrectAnswers || '0', 0) : 0
    };
}

export const resetScore = (): Scores => {
    localStorage.removeItem('correctAnswers');
    localStorage.removeItem('totalQuestions');
    return getScores()
};

