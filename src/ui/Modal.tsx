import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/classnames';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, children, title }) => {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className={cn('bg-white rounded-2xl shadow-2xl max-w-2xl w-full z-10 p-6')} role="dialog" aria-modal="true">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
