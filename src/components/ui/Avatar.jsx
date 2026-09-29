import React from 'react';
import clsx from 'clsx';

export const Avatar = ({ src, name = 'User', size = 'md', className }) => {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={clsx(
        "relative rounded-full flex items-center justify-center font-bold bg-[#E5F4EE] text-[#167C63] border border-[#CFE6DC] shrink-0 overflow-hidden select-none shadow-2xs",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ) : null}
      <span>{getInitials(name)}</span>
    </div>
  );
};

export default Avatar;
