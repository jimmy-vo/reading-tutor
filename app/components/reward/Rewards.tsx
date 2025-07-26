import React from 'react';
import styles from './Rewards.module.css';
import RewardEntry from './RewardEntry';
import { RewardStatus } from '../../models/backend/interface';
import { useRewardService } from '../../context/RewardServiceContext';

const Rewards: React.FC = ({}) => {
  const {
    rewards,
    isAdmin,
    globalBusy,
    addReward,
    removeReward,
    updateReward,
  } = useRewardService();

  const lastBalance =
    rewards.length > 0 ? rewards[rewards.length - 1].balance : 0;

  const totalPending = rewards.reduce((acc, reward) => {
    return reward.status === RewardStatus.Pending ? acc + reward.amount : acc;
  }, 0);

  if ((rewards?.length ?? 0) === 0) return <></>;
  return (
    <div className={styles.rewardPage}>
      <div className={styles.balanceContainer}>
        <p className={styles.heading}>Total: ${lastBalance.toFixed(2)}</p>
        <p className={styles.heading}>Pending: ${totalPending.toFixed(2)}</p>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={[styles.centerAlign, styles.shrink].join(' ')}>
                Date
              </th>
              <th className={styles.centerAlign}>Description</th>
              <th className={styles.centerAlign}>Amount</th>

              <th className={[styles.centerAlign, styles.shrink].join(' ')}>
                Balance
              </th>
              <th className={styles.centerAlign} colSpan={2}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((reward, index) => (
              <RewardEntry
                key={reward.id}
                item={reward}
                prevBalance={index > 0 ? rewards[index - 1].balance : 0}
                onSubmit={updateReward}
                onRemoved={removeReward}
                isAdmin={isAdmin}
                globalBusy={globalBusy}
              />
            ))}
            <RewardEntry
              key="new"
              item={{
                id: `${new Date().getTime()}`,
                date: new Date(),
                description: '',
                amount: 0,
                status: RewardStatus.Pending,
                balance: lastBalance,
              }}
              prevBalance={lastBalance}
              onSubmit={addReward}
              isAdmin={isAdmin}
              globalBusy={globalBusy}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Rewards;
