
export interface ContentSet {
  grade: number;
  topic: string;
  text: string;
  challenges: Challenge[];
}

export interface Challenge {
  id: string;
  explaination: string;
  question: string;
  answer: string;
  expected: string;
  correct: boolean | undefined;
}
