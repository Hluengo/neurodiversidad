import { useState, useCallback, useRef } from 'react';

export interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export function useToast(autoDismissMs = 4000) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: ToastState['type'] = 'info') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => setToast(null), autoDismissMs);
  }, [autoDismissMs]);

  return { toast, showToast };
}
