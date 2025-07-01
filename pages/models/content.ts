
export interface QnA {
  id: string;
  question: string;
  answer: string;
}

export interface Content {
  text: string;
  qna: QnA[];
}
