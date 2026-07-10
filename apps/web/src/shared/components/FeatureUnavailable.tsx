import React from 'react';

interface FeatureUnavailableProps {
  title: string;
  description?: string;
}

export const FeatureUnavailable: React.FC<FeatureUnavailableProps> = ({
  title,
  description = 'This feature will be available in the next release.',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh] bg-gray-50 rounded-lg border border-gray-100 m-4">
      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 max-w-md">{description}</p>
      <button 
        onClick={() => window.history.back()} 
        className="mt-6 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Back
      </button>
    </div>
  );
};
