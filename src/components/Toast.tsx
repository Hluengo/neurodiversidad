import React from 'react';
import { m, AnimatePresence } from 'motion/react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import cn from '../utils/classnames';
import type { ToastState } from '../hooks/useToast';

interface Props {
  toast: ToastState | null;
}

export const Toast: React.FC<Props> = ({ toast }) => {
  return (
    <AnimatePresence>
      {toast && (
        <m.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className={cn(
            "fixed bottom-8 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3 min-w-[300px]",
            toast.type === 'success' ? "bg-emerald-600 text-white" :
            toast.type === 'error' ? "bg-red-600 text-white" :
            "bg-slate-800 text-white"
          )}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
          {toast.type === 'error' && <ShieldAlert className="w-5 h-5" />}
          <span>{toast.message}</span>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
