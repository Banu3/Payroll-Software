import React from 'react';
import clsx from 'clsx';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={clsx(
        "animate-pulse bg-slate-800/80 rounded-lg",
        className
      )}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-4 animate-pulse">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-8 w-48" />
    <div className="space-y-2 pt-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  </div>
);

export default Skeleton;
