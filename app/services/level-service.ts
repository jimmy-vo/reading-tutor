import { countAllCorrectInArrow, getHistoryFromStorage, resetHistoryStorage } from './history-service';
import { removeActiveContentStorage } from './content-service';
import { Grade } from '../models/backend';
import { Config } from '../utils/env';
import { ContentSet } from '../models/view';

const LEVEL_KEY = 'level';

function writeLevel(level: number): void {
    if (level < 0 || level > 9) {
        throw new Error('Level must be between 1 and 9');
    }
    localStorage.setItem(LEVEL_KEY, level.toString());
    resetHistoryStorage();
    removeActiveContentStorage();
}

export function readLevel(): number {
    const level = localStorage.getItem(LEVEL_KEY);
    if (!level) {
        writeLevel(0);
        return 1;
    }
    return parseInt(level, 10);
}

export const updateFromHistory = (history: ContentSet[]): boolean => {
    const gradeId = readLevel();
    var grade = getGrade(gradeId);
    if (!grade) return false;
    var allCorrect = countAllCorrectInArrow(history, gradeId);
    const res = allCorrect >= grade.count;
    if (res) {
        writeLevel(readLevel() + 1);
    }
    return res;
}


export function getGrade(num: number): Grade | null {
    try {
        return Config.grades.find(grade => grade.id === num)!;
    } catch (error) {
        console.error(error)
        return null;
    }
}
