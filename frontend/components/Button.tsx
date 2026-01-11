'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Button = ({
  children,
  isLoading,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      disabled={isLoading || disabled}
      className={`w-full bg-primary-green hover:bg-green-700 text-white font-bold py-2 rounded mt-4 transition-colors shadow-md disabled:opacity-50 ${className}`.trim()}
    >
      {isLoading ? '...' : children}
    </button>
  );
};
