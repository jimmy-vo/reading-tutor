import { ContentSet } from "../models/view/interface";
import axios from "axios"

export namespace GradeItemClient {
    export const createOne = async (historyId: string): Promise<ContentSet | null> => {
        try {
            const response = await axios.post(`/api/history/${historyId}`);
            return parseItem(response.data as ContentSet);
        } catch (error) {
            console.error("Failed to get new content:", error);
            return null
        }
    }
    export const patchOne = async (historyId: string, content: ContentSet): Promise<ContentSet> => {
        try {
            const response = await axios.patch(`/api/history/${historyId}/${content.id}`, content);
            return parseItem(response.data as ContentSet);
        } catch (error) {
            console.error("Failed to get evaluation:", error);
            throw new Error('Failed to get evaluation');
        }
    }

    export const getAll = async (historyId: string): Promise<ContentSet[]> => {
        try {
            const response = await axios.get(`/api/history/${historyId}`);
            const history = response.data as ContentSet[];
            history.forEach(parseItem);
            return history;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const parseItem = (item: ContentSet): ContentSet => {
        item.created = new Date(item.created);
        return item
    };
}
