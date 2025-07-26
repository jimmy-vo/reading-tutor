import React, { createContext, useContext, useState, useEffect } from 'react';
import { Reward, RewardPreset } from '../models/backend/interface';
import { RewardClient } from '../services/rewardClientService';
import { HistoryIdStorage, Util } from '../services/storageService';
import { ConfigClient } from '../services/configClientService';

interface RewardServiceContextType {
  rewards: Reward[];
  presets: RewardPreset[];
  isAdmin: boolean;
  globalBusy: boolean;
  addReward: (reward: Reward) => Promise<Reward>;
  removeReward: (id: string) => Promise<void>;
  updateReward: (reward: Reward) => Promise<Reward>;
}

const RewardServiceContext = createContext<RewardServiceContextType>(undefined);

interface RewardServiceProviderProps {
  children: React.ReactNode;
}

export const RewardServiceProvider: React.FC<RewardServiceProviderProps> = ({
  children,
}) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [presets, setPresets] = useState<RewardPreset[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [historyId, setHistoryId] = useState<string>(undefined);

  useEffect(() => {
    const fetchRewards = async () => {
      const newHistoryId = HistoryIdStorage.read();
      setHistoryId(newHistoryId);
      setIsAdmin(Util.Role.read());
      const [newRewards, newConfig] = await Promise.all([
        RewardClient.getAll(newHistoryId),
        ConfigClient.get(),
      ]);
      setPresets(newConfig.rewards);
      setRewards(newRewards);
    };
    fetchRewards();
  }, [historyId]);

  const [globalBusy, setGlobalBusy] = useState(false);

  const addReward = async (reward: Reward): Promise<Reward> => {
    console.debug('RewardServiceProvider.addReward');
    setGlobalBusy(true);
    const newReward = await RewardClient.createOne(historyId, reward);
    setRewards([...rewards, newReward]);
    setGlobalBusy(false);
    return newReward;
  };

  const removeReward = async (id: string) => {
    console.debug('RewardServiceProvider.removeReward');
    setGlobalBusy(true);
    await RewardClient.deleteOne(historyId, id);
    setRewards(rewards.filter((reward) => reward.id !== id));
    setGlobalBusy(false);
  };

  const updateReward = async (reward: Reward): Promise<Reward> => {
    console.debug('RewardServiceProvider.updateReward');
    setGlobalBusy(true);
    const idx = rewards.findIndex((x) => x.id === reward.id);
    const newReward = await RewardClient.updateOne(historyId, reward);
    const updatedRewards = [...rewards];
    updatedRewards[idx] = newReward;

    for (let i = idx + 1; i < updatedRewards.length; i++) {
      updatedRewards[i] = {
        ...updatedRewards[i],
        balance: updatedRewards[i - 1].balance + updatedRewards[i].amount,
      };
      updatedRewards[i] = await RewardClient.updateOne(
        historyId,
        updatedRewards[i],
      );
    }

    setRewards(updatedRewards);
    setGlobalBusy(false);
    return newReward;
  };

  console.debug('RewardServiceProvider');
  return (
    <RewardServiceContext.Provider
      value={{
        rewards,
        presets,
        isAdmin,
        globalBusy,
        addReward,
        removeReward,
        updateReward,
      }}
    >
      {children}
    </RewardServiceContext.Provider>
  );
};

export const useRewardService = () => useContext(RewardServiceContext);
