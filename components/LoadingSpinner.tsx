
import React from 'react';

interface LoadingSpinnerProps {
  message: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({message}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500"></div>
      <p className="mt-4 text-lg text-gray-300 text-center">{message}</p>
    </div>
  );
};
