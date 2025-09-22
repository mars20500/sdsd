
import React from 'react';
import type { SPFResult } from '../types';

interface ExportButtonProps {
  results: SPFResult[];
  disabled: boolean;
}

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
)

export const ExportButton: React.FC<ExportButtonProps> = ({ results, disabled }) => {
  const handleExport = () => {
    if (results.length === 0) return;

    const headers = ['Domain', 'SPF Record', 'Status'];
    const csvContent = [
      headers.join(','),
      ...results.map(row => [
        `"${row.domain}"`,
        `"${row.record.replace(/"/g, '""')}"`,
        `"${row.status}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = `spf_records_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || results.length === 0}
      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors"
    >
      <ExportIcon />
      Export to CSV
    </button>
  );
};
