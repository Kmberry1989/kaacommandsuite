import type { NextApiRequest, NextApiResponse } from 'next';

// Increase the body size limit to handle base64 image data.
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
}

/**
 * A helper function to make requests to the Google AI APIs.
 * @param apiUrl The endpoint URL for the API.
 * @param payload The request body.
 * @returns The JSON response from the API.
 */
async function handleApiRequest(apiUrl: string, payload: object) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable not set.");
    }
    
    const fullApiUrl = `${apiUrl}?key=${apiKey}`;

    const response = await fetch(fullApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", errorText);
        throw new Error(`API request failed with status: ${response.status}`);
    }

    return response.json();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { action, imageData, prompt } = req.body;

    switch (action) {
      // Handles describing the user's scribble.
      case 'describeScribble': {
        if (!imageData) {
          return res.status(400).json({ error: 'Image data is required.' });
        }
        
        const base64Data = imageData.split(',')[1];
        const payload = {
          contents: [{
            role: "user",
            parts: [
              { text: "Describe this user's drawing in a simple, short, descriptive phrase. This will be used as part of a prompt to generate a new image." },
              { inlineData: { mimeType: "image/png", data: base64Data } }
            ]
          }]
        };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent`;
        
        const result = await handleApiRequest(apiUrl, payload);
        const description = result?.candidates?.[0]?.content?.parts?.[0]?.text || "A user's drawing.";
        
        return res.status(200).json({ description });
      }

      // Handles generating the final image.
      case 'generateImage': {
        if (!prompt) {
          return res.status(400).json({ error: 'Prompt is required.' });
        }
        
        const payload = { 
            instances: [{ prompt }], 
            parameters: { "sampleCount": 1 } 
        };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict`;
        
        const result = await handleApiRequest(apiUrl, payload);

        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
          const imageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
          return res.status(200).json({ imageUrl });
        } else {
          throw new Error('Image data not found in API response.');
        }
      }

      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
