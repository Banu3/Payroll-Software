import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading system workspace...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8 text-center animate-fade-in">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
      <p className="text-sm font-medium text-slate-300">{message}</p>
      <p className="text-xs text-slate-500 mt-1">Verifying encrypted security credentials...</p>
    </div>
  );
};

export default LoadingState;
