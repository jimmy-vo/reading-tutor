
export interface Grade {
    id: number;
    count: number;
    questions: number;
    topics: string[];
    passageFeatures: string[];
    questionFeatures: string[];
}

export interface RewardPreset {
    id: string,
    description: string,
    amount: number,
    isDaily: boolean
}

export interface Config {
    grades: Grade[]
    rewards: RewardPreset[]
}

export enum RewardStatus {
    Pending = 'pending',
    Approved = 'approved'
}

export interface Reward {
    id: string;
    presetId?: string | undefined;
    description: string;
    date: Date;
    status: RewardStatus;
    amount: number;
    balance: number;
}
