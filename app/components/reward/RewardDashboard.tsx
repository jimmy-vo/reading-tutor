import React from 'react';
import Rewards from './Rewards';
import { RewardServiceProvider } from '../../context/RewardServiceContext';

const RewardDashboard: React.FC = () => {
  return (
    <RewardServiceProvider>
      <Rewards />
    </RewardServiceProvider>
  );
};

export default RewardDashboard;
