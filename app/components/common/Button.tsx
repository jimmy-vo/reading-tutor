import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  className?: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  className,
  onClick,
  disabled,
  children,
}) => {
  return (
    <button 
      aria-hidden="true"
      className={className || styles.button}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
