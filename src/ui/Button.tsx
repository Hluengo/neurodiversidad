import React from 'react';
import { cn } from '../utils/classnames';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const BUTTON_BASE = 'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-colors';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-primary text-white hover:brightness-95',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-50',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, children, ...rest }) => {
  return (
    <button className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], className)} {...rest}>
      {children}
    </button>
  );
};

export default Button;
