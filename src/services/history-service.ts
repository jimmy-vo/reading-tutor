import { ContentSet } from '../models/view';
import { removeActiveContentStorage } from './content-service';

const REPORT_KEY = 'list';

export const getHistoryFromStorage = (): ContentSet[] => {
    const reports = localStorage.getItem(REPORT_KEY);
    return reports ? JSON.parse(reports) : [];
};

export const addHistoryToStorage = (contentSet: ContentSet): void => {
    const reports = getHistoryFromStorage();
    reports.unshift(contentSet);
    if (reports.length > 10) {
        reports.pop();
    }
    localStorage.setItem(REPORT_KEY, JSON.stringify(reports));
    removeActiveContentStorage();
};

export const resetHistoryStorage = (): void => {
    localStorage.removeItem(REPORT_KEY);
};

export const countAllCorrectInArrow = (history: ContentSet[], grade: number) => {
    let currentCount = 0;
    const allAnswerCorrectList = history.filter(x => x.grade === grade).map(
        (x) =>
            x.challenges.filter((a) => a.correct === true).length ===
            x.challenges.length,
    );
    for (let i = 0; i < allAnswerCorrectList.length; i++) {
        if (allAnswerCorrectList[i] === true) {
            currentCount++;
        } else {
            break;
        }
    }

    return currentCount;
};
