
export interface ContentSet {
  topic: string;
  id: string;
  created: Date;
  gradeId: number;
  passage: string;
  image?: string;
  challenges: Challenge[];
}

export interface Content {
  topic: string;
  passage: string;
  qna: {
    id: string;
    question: string;
    answer: string;
  }[];
}

export interface Challenge {
  id: string;
  explaination: string;
  question: string;
  answer: string;
  expected: string;
  correct: boolean | undefined;
}

export interface ProgressGrade {
  id: number;
  count: number;
  history: ContentSet[];
}

export enum ItemState {
  incorrect,
  invalidCorrect,
  validCorrect,
  active,
  toDo,
}

export enum GradeState {
  completed,
  active,
  todo,
}

export interface GradeItem {
  state: ItemState;
  value: ContentSet | undefined | null;
}

export interface GradeGroup {
  items: GradeItem[];
  state: GradeState;
  count: number;
  id: number;
}
