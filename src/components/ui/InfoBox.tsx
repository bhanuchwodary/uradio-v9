
import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoBoxProps {
  children: React.ReactNode;
  className?: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        'border-primary/30 bg-primary/10',
        className
      )}
    >
      <Info className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
      <div className="text-sm text-on-surface">{children}</div>
    </div>
  );
};

export default InfoBox;
