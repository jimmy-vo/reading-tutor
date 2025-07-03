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
    localStorage.setItem(REPORT_KEY, JSON.stringify(reports));
    removeActiveContentStorage();
};

export const resetHistoryStorage = (): void => {
    localStorage.removeItem(REPORT_KEY);
};
