import React, { useState, useRef } from 'react';

import styles from './RewardCreate.module.css';
import {
  Reward,
  RewardPreset,
  RewardStatus,
} from '../../models/backend/interface';
import Spinner from '../common/Spinner';
import { useRewardService } from '../../context/RewardServiceContext';

type Option = { key: string; value: string };

interface RewardEntryProps {
  item: Reward;
  prevBalance: number;
  globalBusy: boolean;
  onSubmit: (reward: Reward) => Promise<Reward>;
  className?: string;
}

const dollarConvert = (value) => `$${value.toFixed(2)}`;

const RewardCreate: React.FC<RewardEntryProps> = ({
  item,
  prevBalance,
  globalBusy,
  onSubmit,
  className,
}) => {
  const { presets } = useRewardService();
  const [showDropdown, setShowDropdown] = useState(false);
  const selectRef = React.useRef(null);
  const [isUpdateBusy, setIsUpdateBusy] = useState(false);

  const handlePresetSelect = () => {
    setShowDropdown(!showDropdown);
    if (selectRef.current) {
      selectRef.current.focus();
      selectRef.current.size = presets.length;
    }
    setShowDropdown(!showDropdown);
  };

  const handlePresetChange = async (value) => {
    setShowDropdown(false);
    const preset: RewardPreset | undefined = presets.find(
      (p) => p.id === value,
    );

    setIsUpdateBusy(true);
    await onSubmit({
      ...item,
      presetId: preset?.id,
      description: preset?.description ?? '',
      amount: preset?.amount ?? 0,
      balance: prevBalance,
      status: RewardStatus.Pending,
    });
    setIsUpdateBusy(false);
  };

  const isBusy = globalBusy || isUpdateBusy;

  return (
    <div className={className}>
      <div className={styles.spinnerContainer}>
        <button
          onClick={handlePresetSelect}
          disabled={isBusy}
          className={[styles.actionButton, styles.greyButton].join(' ')}
        >
          {'➕'}
          {showDropdown && (
            <DropdownOnly
              options={[
                ...presets.map((preset) => ({
                  key: preset.id,
                  value: `${preset.description} - ${dollarConvert(
                    preset.amount,
                  )}`,
                })),
                { key: 'Custom', value: 'Custom - $0.00' },
              ]}
              onSelect={(opt) => {
                handlePresetChange(opt.key);
              }}
            />
          )}
        </button>

        {isUpdateBusy && <Spinner size={20} className={styles.spinner} />}
      </div>
    </div>
  );
};
type DropdownOnlyProps = {
  options: Option[];
  onSelect: (option: Option) => void;
};

const DropdownOnly = ({ options, onSelect }: DropdownOnlyProps) => {
  const dropdownRef = useRef(null);

  return (
    <table
      ref={dropdownRef}
      style={{
        border: '1px solid #ccc',
        borderCollapse: 'collapse',
        margin: 0,
        padding: '5px',
        background: '#fff',
        position: 'absolute', // for layering if needed
        bottom: '0px',
        right: '0px',
      }}
    >
      <tbody>
        {options.map((opt, idx) => {
          const [description, amount] = opt.value.split(' - ');
          return (
            <tr
              key={idx}
              style={{
                cursor: 'pointer',
                color: 'black',
                textAlign: 'left',
              }}
              onClick={() => onSelect(opt)}
              onMouseOver={(e) => (e.currentTarget.style.background = '#eee')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
            >
              <td style={{ padding: '5px', border: '1px solid #ccc' }}>
                {description}
              </td>
              <td style={{ padding: '5px', border: '1px solid #ccc' }}>
                {amount}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default RewardCreate;
