import React, { useState, useRef } from 'react';
import { analyzeVideo } from '../services/geminiService';
import { extractFramesFromVideo } from '../utils/mediaUtils';
import LoadingSpinner from './LoadingSpinner';

const VideoAnalyzer: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setAnalysis(null);
      setError(null);
      setStatus(`File selected: ${file.name}`);
    }
  };

  const handleAnalyze = async () => {
    if (!videoFile || !prompt) {
      setError("Please upload a video and enter a prompt.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setAnalysis(null);
    
    try {
      setStatus("Extracting frames from video (this may take a moment)...");
      const frames = await extractFramesFromVideo(videoFile, 1, (progress, frameCount) => {
        setStatus(`Extracting frames... ${progress}% complete (${frameCount} frames)`);
      });

      setStatus(`Analyzing ${frames.length} frames with Gemini...`);
      const result = await analyzeVideo(frames, prompt);
      setAnalysis(result);
      setStatus('Analysis complete!');
    } catch (err: any) {
      setError(err.message || "Failed to analyze video.");
      setStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Video Analyzer</h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="video-upload" className="block text-sm font-medium text-gray-300 mb-2">1. Upload Video</label>
          <input 
            id="video-upload"
            type="file" 
            accept="video/*" 
            onChange={handleVideoUpload} 
            ref={fileInputRef} 
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
          />
        </div>
        <div>
          <label htmlFor="video-prompt" className="block text-sm font-medium text-gray-300 mb-2">2. What do you want to know?</label>
          <textarea
            id="video-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Describe the different hairstyles shown in this tutorial.', 'What is the mood of this video?', 'Summarize the steps in this hair coloring process.'"
            rows={3}
            className="block w-full bg-gray-700 text-white rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !videoFile}
          className="w-full px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-all disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Video'}
        </button>

        {(isLoading || status) && (
            <div className="relative text-center p-4 bg-gray-700 rounded-md">
                {isLoading && <LoadingSpinner />}
                <p className="text-gray-300">{status}</p>
            </div>
        )}

        {error && <p className="mt-2 text-red-400">{error}</p>}

        {analysis && (
          <div>
            <h3 className="text-lg font-semibold border-b border-gray-600 pb-2 mb-3">Analysis Result</h3>
            <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
              {analysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoAnalyzer;
