import React, { useState, useEffect, useRef } from 'react';

const dollarConvert = (value) => `$${value.toFixed(2)}`;
import styles from './RewardEntry.module.css';
import { Reward, RewardStatus } from '../../models/backend/interface';
import Spinner from '../common/Spinner';
import { useRewardService } from '../../context/RewardServiceContext';

interface RewardEntryProps {
  item: Reward;
  prevBalance: number;
  onSubmit: (reward: Reward) => Promise<Reward>;
  onRemoved?: (id: string) => Promise<void>;
  isAdmin: boolean;
  globalBusy: boolean;
}

const RewardEntry: React.FC<RewardEntryProps> = ({
  item,
  prevBalance,
  onSubmit,
  onRemoved = undefined,
  isAdmin,
  globalBusy,
}) => {
  const { presets } = useRewardService();
  const [showDropdown, setShowDropdown] = useState(false);

  const selectRef = React.useRef(null);

  const [original, setOriginal] = useState(item);
  const [description, setDescription] = useState(item.description);
  const [amount, setAmount] = useState(item.amount);
  const [isUpdateBusy, setIsUpdateBusy] = useState(false);
  const [isDeleteBusy, setIsDeleteBusy] = useState(false);
  const [status, setStatus] = useState(item.status);

  useEffect(() => {
    setDescription(item.description);
    setAmount(item.amount);
    setStatus(item.status);
  }, [item]);

  const handlePresetSelect = () => {
    setShowDropdown(!showDropdown);
    if (selectRef.current) {
      selectRef.current.focus();
      selectRef.current.size = presets.length;
    }
    setShowDropdown(!showDropdown);
  };

  const handlePresetChange = (value) => {
    setShowDropdown(false);
    const preset = presets.find((p) => p.id === value);
    setDescription(preset.description);
    setAmount(preset.amount);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setDescription(e.target.value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(parseFloat(e.target.value));
  };

  const handleStatusChange = () => {
    if (!isAdmin) return;
    const newStatus =
      status === RewardStatus.Pending
        ? RewardStatus.Approved
        : RewardStatus.Pending;
    setStatus(newStatus);
  };

  const getBalance = () =>
    prevBalance + (status === RewardStatus.Approved ? amount : 0);

  const handleSave = async () => {
    if (typeof description !== 'string' || isNaN(amount)) return;

    setIsUpdateBusy(true);
    const newOriginal = await onSubmit({
      ...item,
      description: description,
      amount: amount,
      balance: getBalance(),
      status: status,
    });
    setOriginal(newOriginal);
    setIsUpdateBusy(false);
  };

  const handleRemove = () => {
    setIsDeleteBusy(true);
    onRemoved(item.id);
  };

  const readOnly = status === RewardStatus.Approved && !isAdmin;

  const hasNotChanged =
    description === (original ?? item).description &&
    amount === (original ?? item).amount &&
    status === (original ?? item).status;

  const descriptionError = description.trim() === '';
  const amountError = isNaN(amount) || amount === 0;
  const hasError = descriptionError || amountError;
  const canUpdate = hasError || hasNotChanged || globalBusy;
  const canDelete =
    (status === RewardStatus.Approved && !isAdmin) || globalBusy;
  const isUpdateEnabled = isAdmin || status !== RewardStatus.Approved;
  const isDeleteEnabled = onRemoved !== undefined && isUpdateEnabled;
  const isSelectPresetEnabled = onRemoved === undefined;

  return (
    <tr
      className={[
        styles.rewardEntry,
        status === RewardStatus.Approved ? styles.approved : '',
      ].join(' ')}
      key={item.date.getTime().toString()}
    >
      <td className={styles.shrink}>
        {item.date.toLocaleDateString()} {item.date.toLocaleTimeString()}
      </td>
      <td>
        {readOnly ? (
          <p className={styles.dollarCell}>{description}</p>
        ) : (
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            readOnly={readOnly}
            className={`${descriptionError ? styles.error : ''}`}
          />
        )}
      </td>
      <td>
        {readOnly ? (
          <p className={styles.dollarCell}>{dollarConvert(amount)}</p>
        ) : (
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            readOnly={readOnly}
            className={`${amountError ? styles.error : ''}`}
          />
        )}
      </td>
      <td onClick={handleStatusChange}>
        <p className={styles.dollarCell}>
          {status === RewardStatus.Pending
            ? 'N/A'
            : dollarConvert(getBalance())}
        </p>
      </td>
      <td
        className={[
          styles.centerAlign,
          styles.shrink,
          styles.transparentTd,
        ].join(' ')}
      >
        <div className={styles.spinnerContainer}>
          {isDeleteEnabled && (
            <button
              onClick={handleRemove}
              className={[styles.actionButton, styles.redButton].join(' ')}
              disabled={canDelete}
            >
              {'✖️'}
            </button>
          )}
          {isSelectPresetEnabled && (
            <button
              onClick={handlePresetSelect}
              className={[styles.actionButton, styles.greyButton].join(' ')}
            >
              {'❕'}
              {showDropdown && (
                <DropdownOnly
                  options={presets.map(
                    (preset) =>
                      `${preset.description} - ${dollarConvert(preset.amount)}`,
                  )}
                  onSelect={(description) => {
                    const preset = presets.find(
                      (p) => p.description === description,
                    );
                    handlePresetChange(preset.id);
                  }}
                />
              )}
            </button>
          )}

          {isDeleteBusy && <Spinner size={20} className={styles.spinner} />}
        </div>
      </td>

      <td
        className={[
          styles.centerAlign,
          styles.shrink,
          styles.transparentTd,
        ].join(' ')}
      >
        <div className={styles.spinnerContainer}>
          {isUpdateEnabled && (
            <button
              onClick={handleSave}
              className={[
                styles.actionButton,
                styles.greenButton,
                canUpdate ? styles.disabledButton : '',
              ].join(' ')}
              disabled={canUpdate}
            >
              {onRemoved === undefined ? '➕' : '✔️'}
            </button>
          )}
          {isUpdateBusy && <Spinner size={20} className={styles.spinner} />}
        </div>
      </td>
    </tr>
  );
};

const DropdownOnly = ({ options, onSelect }) => {
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState('bottom');

  useEffect(() => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      console.log(rect.bottom, window.innerHeight);
      if (rect.bottom < window.innerHeight / 2) {
        setPosition('top');
      } else {
        setPosition('bottom');
      }
    }
  }, []);

  return (
    <ul
      ref={dropdownRef}
      style={{
        border: '1px solid #ccc',
        listStyle: 'none',
        margin: 0,
        padding: '5px',
        background: '#fff',
        position: 'absolute', // for layering if needed
        [position]: '0px',
        right: '0px',
      }}
    >
      {options.map((opt, idx) => (
        <li
          key={idx}
          style={{ padding: '5px', cursor: 'pointer', color: 'black' }}
          onClick={() => onSelect(opt)}
          onMouseOver={(e) => (e.currentTarget.style.background = '#eee')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
        >
          {opt}
        </li>
      ))}
    </ul>
  );
};

export default RewardEntry;
