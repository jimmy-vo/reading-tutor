import fs from 'fs';
import path from 'path';
import { ContentSet } from '../models/view/interface';
import { Env } from './configService';

export namespace ReadingRepository {
    const getFolder = (historyId: string): string => {
        return path.join(Env.storagePath, historyId, "reading");
    }
    export const checkHistory = (historyId: string) => {
        const dirPath = path.join(Env.storagePath, historyId);
        return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
    }

    export const readHistory = (historyId: string): ContentSet[] => {
        const dirPath = getFolder(historyId);
        if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
            const files = fs.readdirSync(dirPath);
            const history: ContentSet[] = [];
            files.forEach(file => {
                const filePath = path.join(dirPath, file);
                if (fs.lstatSync(filePath).isFile() && path.extname(file) === '.json') {
                    try {
                        const fileContent = fs.readFileSync(filePath, 'utf-8');
                        const item = JSON.parse(fileContent) as ContentSet;
                        history.push(item);
                    } catch (error) {
                        console.error(`Failed to read or parse file ${filePath}:`, error);
                    }
                }
            });
            return history;
        } else {
            throw new Error('History not found');
        }
    };

    export const getItem = (historyId: string, itemId: string) => {
        const filePath = path.join(getFolder(historyId), `${itemId}.json`);
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(fileContent) as ContentSet;
        } else {
            throw new Error('Item not found');
        }
    }

    export const addItem = (historyId: string, item: ContentSet) => {
        const dirPath = getFolder(historyId);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
        const filePath = path.join(dirPath, `${item.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(item, null, 2), 'utf-8');
    }

    export const updateItem = (historyId: string, item: ContentSet) => {
        const filePath = path.join(getFolder(historyId), `${item.id}.json`);
        if (fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(item, null, 2), 'utf-8');
        } else {
            throw new Error('Item not found');
        }
    }
}