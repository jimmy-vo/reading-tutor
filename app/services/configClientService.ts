import axios from 'axios';
import { Config } from '../models/backend/interface';

export namespace ConfigClient {
    export const get = async (): Promise<Config> => {
        try {
            const response = await axios.get('/api/config');
            return response.data as Config;
        } catch (error) {
            console.error('Failed to get grades:', error);
            return null;
        }
    };
}
