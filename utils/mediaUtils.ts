export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            reject(new Error("Failed to convert blob to base64"));
        }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const extractFramesFromVideo = (
  videoFile: File,
  fps: number,
  onProgress: (progress: number, frameCount: number) => void
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const frames: string[] = [];
    
    video.preload = 'metadata';
    video.src = URL.createObjectURL(videoFile);

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const duration = video.duration;
      const interval = 1 / fps;
      let currentTime = 0;
      let frameCount = 0;

      const captureFrame = () => {
        if (!context) {
            reject(new Error("Could not get canvas context"));
            return;
        }
        video.currentTime = currentTime;
      };

      video.onseeked = () => {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        frames.push(dataUrl.split(',')[1]);

        frameCount++;
        onProgress(Math.round((currentTime / duration) * 100), frameCount);
        
        currentTime += interval;
        if (currentTime <= duration) {
          captureFrame();
        } else {
          URL.revokeObjectURL(video.src);
          resolve(frames);
        }
      };
      
      video.onerror = (e) => {
        URL.revokeObjectURL(video.src);
        reject(new Error("Error processing video file."));
      }

      captureFrame();
    };
  });
};
