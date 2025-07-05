import { ContentSet } from '../models/view';
import { removeActiveContentStorage } from './contentService';

const HISTORY_KEY = 'list';

export namespace HistoryStorage {

    export const read = (): ContentSet[] => {
        const reports = localStorage.getItem(HISTORY_KEY);
        return reports ? JSON.parse(reports) : [];
    };

    export const write = (history: ContentSet[]) => {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
}

export const updateHistory = (contentSet: ContentSet): void => {
    const history = HistoryStorage.read();
    history.unshift(contentSet);
    if (history.length > 10) {
        history.pop();
    }
    HistoryStorage.write(history);
    removeActiveContentStorage();
};

export const resetHistory = (): void => {
    HistoryStorage.write([]);
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
