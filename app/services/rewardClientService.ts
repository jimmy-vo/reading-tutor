import { Reward } from "../models/backend/interface";
import axios from "axios"

export namespace RewardClient {
    export const getAll = async (historyId: string): Promise<Reward[]> => {
        try {
            console.debug('RewardClient.getAll');
            const response = await axios.get(`/api/rewards?historyId=${historyId}`);
            return (response.data as Reward[]).map(parseItem);
        } catch (error) {
            console.error("Failed to get rewards:", error);
            return [];
        }
    };

    export const createOne = async (historyId: string, reward: Reward): Promise<Reward | null> => {
        try {
            console.debug('RewardClient.createOne', reward);
            const response = await axios.post(`/api/rewards?historyId=${historyId}`, reward);
            return parseItem(response.data as Reward);
        } catch (error) {
            console.error("Failed to create reward:", error);
            return null;
        }
    };

    export const updateOne = async (historyId: string, reward: Reward): Promise<Reward> => {
        try {
            console.debug('RewardClient.updateOne', reward);
            const response = await axios.patch(`/api/rewards/${reward.id}?historyId=${historyId}`, reward);
            return parseItem(response.data as Reward);
        } catch (error) {
            console.error("Failed to update reward:", error);
            throw new Error('Failed to update reward');
        }
    };

    export const deleteOne = async (historyId: string, rewardId: string): Promise<void> => {
        try {
            console.debug('RewardClient.deleteOne', rewardId);
            await axios.delete(`/api/rewards/${rewardId}?historyId=${historyId}`);
        } catch (error) {
            console.error("Failed to delete reward:", error);
            throw new Error('Failed to delete reward');
        }
    };

    const parseItem = (item: Reward): Reward => {
        item.date = new Date(item.date);
        return item
    };
}
