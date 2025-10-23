import { GoogleGenAI, Modality, Part } from "@google/genai";
import type { Hairstyle, HairColor } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const applyHairstyle = async (
  base64Image: string,
  style: Hairstyle,
  color: HairColor
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: `Apply a ${color} ${style} hairstyle to the person in the image. Keep the face and background unchanged.`,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image data found in Gemini response.");

  } catch (error) {
    console.error("Error applying hairstyle with Gemini:", error);
    throw new Error("Failed to generate hairstyle. Please try again.");
  }
};

export const editImageWithPrompt = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error("No image data found in Gemini response.");
  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    throw new Error("Failed to edit image. Please try again.");
  }
};

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes;
    }

    throw new Error("No image was generated.");
  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};


export const fetchHairTrends = async (): Promise<{text: string, sources: any[]}> => {
  try {
    const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: "What are the latest hairstyle and hair color trends for this season? Be descriptive.",
       config: {
         tools: [{googleSearch: {}}],
       },
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, sources };
  } catch (error) {
    console.error("Error fetching trends with Gemini:", error);
    throw new Error("Failed to fetch hair trends. Please try again.");
  }
};

export const analyzeVideo = async (frames: string[], prompt: string): Promise<string> => {
  try {
    const imageParts: Part[] = frames.map(frame => ({
      inlineData: {
        mimeType: 'image/jpeg',
        data: frame,
      }
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: [{ text: prompt }, ...imageParts] },
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing video with Gemini:", error);
    throw new Error("Failed to analyze video. Please try again.");
  }
};
