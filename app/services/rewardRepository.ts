import fs from 'fs';
import path from 'path';
import { Reward } from '../models/backend/interface';
import { Env } from './configService';

export const readAllRewards = (historyId: string): Reward[] => {
    const dirPath = path.join(Env.storagePath, historyId, 'reward');
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    const files = fs.readdirSync(dirPath);
    const rewards: Reward[] = [];
    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        if (fs.lstatSync(filePath).isFile() && path.extname(file) === '.json') {
            try {
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const reward = JSON.parse(fileContent) as Reward;
                rewards.push(reward);
            } catch (error) {
                console.error(`Failed to read or parse file ${filePath}:`, error);
            }
        }
    });
    return rewards;
};

export const deleteReward = (historyId: string, rewardId: string) => {
    const filePath = path.join(Env.storagePath, historyId, 'reward', `${rewardId}.json`);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    } else {
        throw new Error('Reward not found');
    }
};

export const writeReward = (historyId: string, reward: Reward) => {
    const dirPath = path.join(Env.storagePath, historyId, 'reward');
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    const filePath = path.join(dirPath, `${reward.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(reward, null, 2), 'utf-8');
};
