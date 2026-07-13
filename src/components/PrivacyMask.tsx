import React from 'react';

interface PrivacyMaskProps {
  text: string;
  visible: boolean;
}

export const PrivacyMask = React.memo(({ text, visible }: PrivacyMaskProps) => {
  if (visible) return <span>{text}</span>;
  return (
    <span 
      data-testid="privacy-mask"
      className="bg-slate-300 text-transparent select-none rounded px-1 blur-[4px]"
    >
      {text.split(' ').map(w => '█'.repeat(w.length)).join(' ')}
    </span>
  );
});
