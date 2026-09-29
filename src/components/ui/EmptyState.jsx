import React from 'react';
import { Inbox } from 'lucide-react';
import clsx from 'clsx';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = "No data found",
  description = "There are no records to display at this time.",
  actionLabel,
  onAction,
  className
}) => {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center p-8 text-center bg-[#F3F7F5] border border-dashed border-[#BCCBC3] rounded-[12px] my-2",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-[#E5F4EE] border border-[#CFE6DC] flex items-center justify-center text-[#167C63] mb-3">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-[#12201A] tracking-tight">{title}</h3>
      <p className="text-xs text-[#5A6A61] mt-1 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
