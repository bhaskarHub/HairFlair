import React, { useState } from 'react';
import { fetchHairTrends } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const TrendWatch: React.FC = () => {
  const [trends, setTrends] = useState<{ text: string; sources: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchTrends = async () => {
    setError(null);
    setIsLoading(true);
    setTrends(null);
    try {
      const result = await fetchHairTrends();
      setTrends(result);
    } catch (err: any) {
      setError(err.message || "Failed to fetch trends.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Trend Watch</h2>
      <p className="text-gray-400 mb-6 text-center">
        Get the latest scoop on hairstyle and color trends, grounded in real-time data from Google Search.
      </p>
      <div className="text-center mb-8">
        <button
          onClick={handleFetchTrends}
          disabled={isLoading}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-all disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Fetching...' : 'Fetch Latest Trends'}
        </button>
      </div>

      {isLoading && <div className="flex justify-center"><LoadingSpinner /></div>}
      {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
      
      {trends && (
        <div className="space-y-6">
          <div className="prose prose-invert prose-lg max-w-none text-gray-300 whitespace-pre-wrap">
            {trends.text}
          </div>
          <div>
            <h3 className="text-lg font-semibold border-b border-gray-600 pb-2 mb-3">Sources</h3>
            <ul className="list-disc list-inside space-y-2">
              {trends.sources.map((chunk, index) => (
                chunk.web && (
                    <li key={index}>
                        <a 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-400 hover:text-indigo-300 hover:underline"
                        >
                        {chunk.web.title || chunk.web.uri}
                        </a>
                    </li>
                )
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendWatch;
