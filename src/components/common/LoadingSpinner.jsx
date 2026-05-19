import React from 'react';

const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizeClasses = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3' };

  const spinner = (
    <div className={`${sizeClasses[size]} border-gray-200 border-t-brand-600 rounded-full animate-spin`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <span className="font-heading text-3xl font-bold text-deep-forest tracking-[0.2em] animate-pulse">
            PELLICLE
          </span>
          {spinner}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
