import { Env } from "./configService";

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


export namespace HistoryIdStorage {
    const defaultValue = Env.defaultHistoryId
    const KEY = 'historyId';
    export const write = (id: string) => {
        console.debug("HistoryIdStorage.write", id)
        localStorage.setItem(KEY, id);
    }

    export const read = (): string => {
        console.debug("HistoryIdStorage.read")
        const id = localStorage.getItem(KEY);
        if (!id) {
            write(defaultValue);
            return defaultValue;
        }
        return id;
    }
}