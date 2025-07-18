
export interface ContentSet {
  created?: Date;
  grade: number;
  topic: string;
  text: string;
  image: string | undefined | null;
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
  todo,
}

export enum GradeState {
  completed,
  active,
  todo,
}

export interface GradeItem {
  state: ItemState;
  contentSet: ContentSet | undefined | null;
}

export interface GradeGroup {
  dots: GradeItem[];
  gradeId: number;
  state: GradeState;
}