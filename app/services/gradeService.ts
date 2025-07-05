import { countAllCorrectInArrow } from './historyService';
import { removeActiveContentStorage } from './contentService';
import { Grade } from '../models/backend';
import { ContentSet } from '../models/view';
import { Config } from './configService';

const LEVEL_KEY = 'level';

export namespace GradeStorage {

    export const write = (level: number) => {
        if (level < 0 || level > 9) {
            throw new Error('Level must be between 1 and 9');
        }
        localStorage.setItem(LEVEL_KEY, level.toString());
    }

    export const read = (): number => {
        const level = localStorage.getItem(LEVEL_KEY);
        if (!level) {
            write(0);
            return 1;
        }
        return parseInt(level, 10);
    }
}

export const updateFromHistory = (history: ContentSet[]): boolean => {
    const gradeId = GradeStorage.read();
    var grade = getGrade(gradeId);
    if (!grade) return false;
    var allCorrect = countAllCorrectInArrow(history, gradeId);
    const res = allCorrect >= grade.count;
    if (res) {
        GradeStorage.write(gradeId + 1);
        removeActiveContentStorage();
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
