export interface QnA {
  id: string;
  question: string;
  answer: string;
}

export interface Content {
  text: string;
  qna: QnA[];
}

export interface Scores {
  total: number;
  correct: number;
}

export interface ContentSet {
  content: Content;
  topic: string;
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

export interface AnswerEvaluation {
  id: string;
  suggestion: string;
  answer: string;
  correct: boolean;
}

export interface ReadingReport {
  contentSet: ContentSet;
  evaluation: AnswerEvaluation[]
}
