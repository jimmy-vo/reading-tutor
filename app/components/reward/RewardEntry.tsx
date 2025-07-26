import React, { useState, useEffect, useRef, useCallback } from 'react';

const dollarConvert = (value) => `$${value.toFixed(2)}`;
import styles from './RewardEntry.module.css';
import { Reward, RewardStatus } from '../../models/backend/interface';
import Spinner from '../common/Spinner';
import { useRewardService } from '../../context/RewardServiceContext';

interface RewardEntryProps {
  item: Reward;
  prevBalance: number;
  onSubmit: (reward: Reward) => Promise<Reward>;
  onRemoved: (id: string) => Promise<void>;
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

  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

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
        {readOnly || item.presetId !== undefined ? (
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
      <td
        onClick={handleStatusChange}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <p className={styles.dollarCell}>
          {status === RewardStatus.Pending
            ? 'N/A'
            : dollarConvert(getBalance())}
        </p>
        {showTooltip && (
          <div
            className={`${styles.tooltip} ${
              showTooltip ? styles.showTooltip : ''
            }`}
          >
            {presets.find((x) => x.id == item.presetId)?.description ??
              'Custom'}
          </div>
        )}
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
              {'✔️'}
            </button>
          )}
          {isUpdateBusy && <Spinner size={20} className={styles.spinner} />}
        </div>
      </td>
    </tr>
  );
};

export default RewardEntry;
