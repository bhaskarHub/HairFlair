import React, { useState, useRef } from 'react';
import { editImageWithPrompt } from '../services/geminiService';
import { blobToBase64 } from '../utils/mediaUtils';
import LoadingSpinner from './LoadingSpinner';

const StyleEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditedImage(null);
      setError(null);
      setIsLoading(true);
      try {
        const base64 = await blobToBase64(file);
        setOriginalImage(base64);
      } catch (err) {
        setError("Failed to load image.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (!originalImage || !prompt) {
      setError("Please upload an image and enter a prompt.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setEditedImage(null);
    try {
      const result = await editImageWithPrompt(originalImage, prompt);
      setEditedImage(result);
    } catch (err: any) {
      setError(err.message || "Failed to edit image.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Controls */}
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Style Editor</h2>
            <div>
              <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">1. Upload Image</label>
              <input 
                id="image-upload"
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                ref={fileInputRef} 
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
              />
            </div>
             <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">2. Describe Your Edit</label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Add a retro filter', 'Change the background to a beach', 'Make hair color vibrant pink'"
                  rows={3}
                  className="block w-full bg-gray-700 text-white rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
             </div>
             <button
                onClick={handleGenerate}
                disabled={isLoading || !originalImage}
                className="w-full px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-all disabled:bg-gray-500 disabled:cursor-not-allowed"
             >
                {isLoading ? 'Generating...' : 'Apply Edit'}
             </button>
             {error && <p className="mt-2 text-red-400">{error}</p>}
        </div>
        {/* Image Previews */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-center font-semibold text-gray-400">Original</h3>
            <div className="relative aspect-square w-full bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                {originalImage ? <img src={`data:image/jpeg;base64,${originalImage}`} alt="Original" className="w-full h-full object-cover" /> : <span className="text-gray-500">Upload an image</span>}
            </div>
          </div>
           <div className="space-y-2">
            <h3 className="text-center font-semibold text-gray-400">Edited</h3>
            <div className="relative aspect-square w-full bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                {isLoading && <LoadingSpinner />}
                {editedImage ? <img src={`data:image/jpeg;base64,${editedImage}`} alt="Edited" className="w-full h-full object-cover" /> : <span className="text-gray-500">Your edit will appear here</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleEditor;
