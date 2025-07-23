
export interface LlmQnA {
  id: string;
  question: string;
  answer: string;
}

export interface LlmContent {
  passage: string;
  qna: LlmQnA[];
}


export interface LlmEvaluation {
  id: string;
  suggestion: string;
  correct: boolean;
}