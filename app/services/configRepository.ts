import fs from 'fs';
import path from 'path';
import { Config } from '../models/backend/interface';
import { Env } from './configService';

export namespace ConfigRepository {
    const configPath = path.join(Env.storagePath, 'config.json');

    export const getGrades = (): Config => {
        const data = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(data) as Config;
    };
}
