import { LazyMotion, domAnimation } from 'motion/react';
import type { ReactNode } from 'react';

export const MotionProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <LazyMotion features={domAnimation} strict>
    {children}
  </LazyMotion>
);
