
import React from 'react';
import type { SPFResult, SPFStatus } from '../types';

const StatusBadge: React.FC<{ status: SPFStatus }> = ({ status }) => {
  const baseClasses = "px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full";
  const statusClasses = {
    'Found': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Not Found': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    'Error': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    'Pending': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 animate-pulse',
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};


export const ResultsTable: React.FC<{ results: SPFResult[] }> = ({ results }) => {
    if (results.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400">No results to display yet.</p>;
    }

  return (
    <div className="overflow-x-auto">
        <div className="align-middle inline-block min-w-full">
            <div className="shadow-sm overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Domain
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            SPF Record
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {results.map(({ domain, record, status }, index) => (
                        <tr key={`${domain}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{domain}</td>
                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-500 dark:text-gray-300 break-all font-mono">{record || '...'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            <StatusBadge status={status} />
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
