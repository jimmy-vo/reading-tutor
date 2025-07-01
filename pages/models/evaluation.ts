export interface EvaluationOutput {
    questionId: string;
    suggestion: string;
    correct: boolean
};
export interface EvaluationInputQnA {
    questionId: string;
    question: string;
    obtainedAnswer: string;
    expectedAnswer: string;
};
export interface EvaluationInput {
    text: string;
    qna: EvaluationInputQnA[];
};
