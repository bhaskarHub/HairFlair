import React, { useState } from 'react';
import { generateImageFromPrompt } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const IdeaGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) {
      setError("Please enter a prompt to generate an image.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setGeneratedImage(null);
    try {
      const result = await generateImageFromPrompt(`A photorealistic image of a person with the following hairstyle: ${prompt}`);
      setGeneratedImage(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
         {/* Controls */}
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Idea Generator</h2>
            <div>
                <label htmlFor="idea-prompt" className="block text-sm font-medium text-gray-300 mb-2">Describe a Hairstyle Idea</label>
                <textarea
                  id="idea-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'A futuristic cyberpunk hairstyle with neon highlights', 'Elegant braided updo with flowers', 'Short spiky hair with a galaxy color pattern'"
                  rows={4}
                  className="block w-full bg-gray-700 text-white rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
             </div>
             <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt}
                className="w-full px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-all disabled:bg-gray-500 disabled:cursor-not-allowed"
             >
                {isLoading ? 'Generating...' : 'Generate Image'}
             </button>
             {error && <p className="mt-2 text-red-400">{error}</p>}
        </div>

        {/* Image Preview */}
        <div className="space-y-2">
            <h3 className="text-center font-semibold text-gray-400">Generated Idea</h3>
            <div className="relative aspect-square w-full bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                {isLoading && <LoadingSpinner />}
                {generatedImage ? <img src={`data:image/jpeg;base64,${generatedImage}`} alt="Generated hairstyle" className="w-full h-full object-cover" /> : <span className="text-gray-500 p-4 text-center">Your generated hairstyle idea will appear here</span>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaGenerator;
