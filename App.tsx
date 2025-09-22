import React, { useState, useCallback } from 'react';
import { DomainInput } from './components/DomainInput';
import { ResultsTable } from './components/ResultsTable';
import { ProgressBar } from './components/ProgressBar';
import { ExportButton } from './components/ExportButton';
import { lookupSpfForInput } from './services/dnsService';
import type { SPFResult } from './types';
import { BATCH_SIZE, DELAY_BETWEEN_BATCHES } from './constants';

const App: React.FC = () => {
  const [domainsInput, setDomainsInput] = useState<string>('');
  const [results, setResults] = useState<SPFResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    const inputs = domainsInput
      .split(/[\s,;\n]+/)
      .map(d => d.trim())
      .filter(d => d.length > 0)
      .filter((d, index, self) => self.indexOf(d) === index);

    if (inputs.length === 0) {
      setError('Please enter at least one domain or IP address.');
      setIsLoading(false);
      return;
    }
    
    if (inputs.length > 10000) {
      setError('You can look up a maximum of 10,000 domains or IPs at a time.');
      setIsLoading(false);
      return;
    }

    const initialResults: SPFResult[] = inputs.map(input => ({
      domain: input,
      record: '',
      status: 'Pending',
    }));
    setResults(initialResults);

    try {
      let allResults = [...initialResults];
      for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
        const batch = inputs.slice(i, i + BATCH_SIZE);
        
        // Promise.all preserves the order.
        const batchResults = await Promise.all(batch.map(input => lookupSpfForInput(input)));

        // Update the main results array based on the original batch order.
        batchResults.forEach((result, index) => {
          const originalInput = batch[index];
          const resultIndexInAllResults = allResults.findIndex(r => r.domain === originalInput);
          if (resultIndexInAllResults !== -1) {
            allResults[resultIndexInAllResults] = result;
          }
        });

        setResults([...allResults]); // Update UI with processed batch
        
        const processedCount = Math.min(i + BATCH_SIZE, inputs.length);
        setProgress(Math.round((processedCount / inputs.length) * 100));

        if (i + BATCH_SIZE < inputs.length) {
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }
      }
    } catch (e) {
      console.error(e);
      setError('An unexpected error occurred during the lookup process.');
      setResults(prev => prev.map(r => r.status === 'Pending' ? { ...r, status: 'Error', record: 'Processing failed.' } : r));
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  }, [domainsInput]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
            Bulk SPF Record Lookup
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            A fast, reliable tool for bulk lookups of up to 10,000 domains or IPs at once.
          </p>
        </header>

        <main>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
            <DomainInput
              value={domainsInput}
              onChange={e => setDomainsInput(e.target.value)}
              onSubmit={handleLookup}
              isLoading={isLoading}
            />
            {error && (
              <div className="mt-4 text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>
          
          {(isLoading || results.length > 0) && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Results</h2>
                <ExportButton results={results} disabled={isLoading} />
              </div>
              <ProgressBar progress={progress} />
              <div className="mt-4">
                <ResultsTable results={results} />
              </div>
            </div>
          )}
        </main>

        <footer className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Bulk SPF Lookup.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;