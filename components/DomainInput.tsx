import React from 'react';

interface DomainInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


export const DomainInput: React.FC<DomainInputProps> = ({ value, onChange, onSubmit, isLoading }) => {
  return (
    <div>
      <label htmlFor="domains" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Enter Domains or IPs (one per line, max 10000)
      </label>
      <textarea
        id="domains"
        name="domains"
        rows={10}
        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 transition"
        placeholder="google.com&#10;github.com&#10;8.8.8.8"
        value={value}
        onChange={onChange}
        disabled={isLoading}
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              Processing...
            </>
          ) : 'Lookup SPF Records'}
        </button>
      </div>
    </div>
  );
};