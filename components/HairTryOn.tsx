import React, { useState, useRef, useEffect, useCallback } from 'react';
import { applyHairstyle } from '../services/geminiService';
import type { Hairstyle, HairColor } from '../types';
import { HAIRSTYLES, HAIR_COLORS } from '../constants';
import Dropdown from './Dropdown';
import LoadingSpinner from './LoadingSpinner';

const HairTryOn: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Hairstyle | ''>('');
  const [selectedColor, setSelectedColor] = useState<HairColor | ''>('');

  const [mainPreview, setMainPreview] = useState<{ src: string; isLoading: boolean }>({ src: '', isLoading: false });
  const [autoPreview1, setAutoPreview1] = useState<{ src: string; isLoading: boolean; style: Hairstyle; color: HairColor }>({ src: `https://picsum.photos/seed/1/200/200`, isLoading: false, style: 'Long Wavy', color: 'Blonde' });
  const [autoPreview2, setAutoPreview2] = useState<{ src: string; isLoading: boolean; style: Hairstyle; color: HairColor }>({ src: `https://picsum.photos/seed/2/200/200`, isLoading: false, style: 'Pixie', color: 'Brunette' });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const autoUpdateIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    let mediaStream: MediaStream;
    const startCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access denied. Please allow camera access in your browser settings.");
      }
    };

    startCamera();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState >= 2) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        return canvas.toDataURL('image/jpeg').split(',')[1];
      }
    }
    return null;
  }, []);
  
  const updateAutoPreviews = useCallback(async () => {
    const frame = captureFrame();
    if (!frame) return;

    const newStyle1 = HAIRSTYLES[Math.floor(Math.random() * HAIRSTYLES.length)];
    const newColor1 = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
    const newStyle2 = HAIRSTYLES[Math.floor(Math.random() * HAIRSTYLES.length)];
    const newColor2 = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];

    setAutoPreview1(prev => ({ ...prev, isLoading: true, style: newStyle1, color: newColor1 }));
    setAutoPreview2(prev => ({ ...prev, isLoading: true, style: newStyle2, color: newColor2 }));

    try {
      const [img1, img2] = await Promise.all([
        applyHairstyle(frame, newStyle1, newColor1),
        applyHairstyle(frame, newStyle2, newColor2)
      ]);
      setAutoPreview1(prev => ({ ...prev, src: `data:image/jpeg;base64,${img1}`, isLoading: false }));
      setAutoPreview2(prev => ({ ...prev, src: `data:image/jpeg;base64,${img2}`, isLoading: false }));
    } catch (err) {
      console.error("Failed to update auto previews:", err);
      setAutoPreview1(prev => ({ ...prev, isLoading: false }));
      setAutoPreview2(prev => ({ ...prev, isLoading: false }));
    }
  }, [captureFrame]);

  useEffect(() => {
    if (stream) {
      const id = window.setTimeout(updateAutoPreviews, 1000); // Initial update
      autoUpdateIntervalRef.current = window.setInterval(updateAutoPreviews, 10000);
      return () => {
        clearTimeout(id);
        if (autoUpdateIntervalRef.current) clearInterval(autoUpdateIntervalRef.current);
      }
    }
  }, [stream, updateAutoPreviews]);

  useEffect(() => {
    const generateMainPreview = async () => {
      if (selectedStyle && selectedColor && stream) {
        setMainPreview({ src: '', isLoading: true });
        const frame = captureFrame();
        if (frame) {
          try {
            const result = await applyHairstyle(frame, selectedStyle, selectedColor);
            setMainPreview({ src: `data:image/jpeg;base64,${result}`, isLoading: false });
          } catch (err: any) {
            setError(err.message || 'Could not generate the hairstyle.');
            setMainPreview({ src: '', isLoading: false });
          }
        } else {
            setMainPreview({ src: '', isLoading: false });
        }
      }
    };
    generateMainPreview();
  }, [selectedStyle, selectedColor, stream, captureFrame]);

  const PreviewWindow: React.FC<{ title: string; src: string; isLoading: boolean; className?: string }> = ({ title, src, isLoading, className = '' }) => (
    <div className={`relative aspect-square w-full bg-gray-800 rounded-lg overflow-hidden shadow-lg ${className}`}>
      {isLoading && <LoadingSpinner />}
      <img src={src} alt={title} className="w-full h-full object-cover" />
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-xs text-center truncate">
        {title}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="text-center bg-gray-800 p-10 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-red-400">Camera Error</h2>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="text-center bg-gray-800 p-10 rounded-lg shadow-xl flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
        <h2 className="text-2xl font-bold mt-6 mb-4">Starting Camera...</h2>
        <p className="text-gray-400">Please allow camera access in your browser.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <aside className="lg:col-span-1 space-y-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-semibold mb-4">Customize Your Look</h3>
          <div className="space-y-4">
            <Dropdown id="hairstyle" label="Hairstyle" options={HAIRSTYLES} value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value as Hairstyle)} />
            <Dropdown id="haircolor" label="Hair Color" options={HAIR_COLORS} value={selectedColor} onChange={(e) => setSelectedColor(e.target.value as HairColor)} />
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-semibold mb-4">Automatic Suggestions</h3>
          <div className="grid grid-cols-2 gap-4">
            <PreviewWindow title={`${autoPreview1.color} ${autoPreview1.style}`} src={autoPreview1.src} isLoading={autoPreview1.isLoading} />
            <PreviewWindow title={`${autoPreview2.color} ${autoPreview2.style}`} src={autoPreview2.src} isLoading={autoPreview2.isLoading} />
          </div>
        </div>
      </aside>
      <main className="lg:col-span-2 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-xl">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100"></video>
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">LIVE FEED</div>
            </div>
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-xl flex items-center justify-center">
                {mainPreview.isLoading && <LoadingSpinner />}
                {mainPreview.src ? (
                <img src={mainPreview.src} alt="Your new look" className="w-full h-full object-cover" />
                ) : (
                <div className="text-center text-gray-400 p-4">
                    <p>Your hairstyle preview will appear here.</p>
                    <p className="text-sm">Select a style and color to begin.</p>
                </div>
                )}
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">PREVIEW</div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default HairTryOn;