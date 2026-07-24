import React from 'react';
import { m } from 'motion/react';
import cn from '../../utils/classnames';

interface Props {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  onClick?: () => void;
}

export const StatCard: React.FC<Props> = React.memo(({ title, value, icon: Icon, color, onClick }) => (
  <m.div
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && onClick) onClick(); }}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    className={cn(
      "glass-card p-6 flex items-center gap-5 transition-all",
      onClick && "cursor-pointer hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
    )}
  >
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg", color)}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 tabular-nums">{value}</h3>
    </div>
  </m.div>
));

StatCard.displayName = 'StatCard';

export default StatCard;
