export interface QnA {
  id: string;
  question: string;
  answer: string;
}

export interface Content {
  text: string;
  qna: QnA[];
}
export interface EvaluationOutput {
  id: string;
  suggestion: string;
  correct: boolean;
}

export interface EvaluationInputQnA {
  id: string;
  question: string;
  obtainedAnswer: string;
  expectedAnswer: string;
}

export interface EvaluationInput {
  text: string;
  qna: EvaluationInputQnA[];
}
