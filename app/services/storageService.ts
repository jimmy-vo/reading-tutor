import { ContentSet } from "../models/view/interface";

export namespace Util {
    export const getGuid = (): string => {
        // Returns RFC4122 version 4 compliant UUID
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

export namespace InactiveTrackerStorage {
    const KEY = 'inactiveTime';
    const defaultValue: number = 60 * 4
    export const read = (): number => {
        console.debug("InactiveTrackerStorage.read")
        const inactiveTime = localStorage.getItem(KEY);
        if (!inactiveTime) {
            localStorage.setItem(KEY, defaultValue.toString());
            return defaultValue;
        }
        return parseInt(inactiveTime, 10);
    };
}

export namespace HistoryStorage {

    const HISTORY_KEY = 'list';
    export const read = (): ContentSet[] => {
        console.debug("HistoryStorage.read")
        const reports = localStorage.getItem(HISTORY_KEY);
        const history = reports ? JSON.parse(reports) : [];

        const yesterday1am = new Date();
        yesterday1am.setDate(yesterday1am.getDate() - 1);
        yesterday1am.setHours(12, 0, 0, 0);

        history.forEach((item, index) => {
            if (!item.id) {
                item.id = Util.getGuid();
            }
            if (!item.created) {
                item.created = new Date(yesterday1am.getTime() - index * 60000);
            } else {
                item.created = new Date(item.created);
            }
        });

        return history;
    };

    export const write = (history: ContentSet[]) => {
        // console.debug("HistoryStorage.write", history)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
}

export namespace GradeStorage {

    const LEVEL_KEY = 'level';
    export const write = (level: number) => {
        console.debug("ContentStorage.write", level)
        if (level < 0 || level > 9) {
            throw new Error('Level must be between 1 and 9');
        }
        localStorage.setItem(LEVEL_KEY, level.toString());
    }

    export const read = (): number => {
        console.debug("GradeStorage.read")
        const level = localStorage.getItem(LEVEL_KEY);
        if (!level) {
            write(0);
            return 0;
        }
        return parseInt(level, 10);
    }
}