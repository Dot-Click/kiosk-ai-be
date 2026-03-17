import { Router } from 'express';
import axios from 'axios';

console.log('[AI ROUTER] module loaded');
const router = Router();

// NOTE: for development or quick testing you can hardcode a key here.
// In production you'd normally set process.env.OPENAI_API_KEY instead.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (OPENAI_API_KEY) {
  console.log('[AI ROUTER] using API key length', OPENAI_API_KEY.length);
} else {
  console.error('[AI ROUTER] WARNING: OPENAI_API_KEY is not set in environment variables!');
}

/**
 * POST /api/ai/generate
 * Body: { prompt: string, style?: string, count?: number, additionalStyle?: string }
 */
router.post('/generate', async (req, res) => {
  const { prompt, style, count = 4, additionalStyle, image } = req.body as {
    prompt?: string;
    style?: string;
    count?: number;
    additionalStyle?: string;
    image?: string;
  };

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ success: false, message: 'prompt is required' });
  }

  if (!OPENAI_API_KEY) {
    console.error('[AI ROUTER] missing OPENAI_API_KEY');
    return res.status(500).json({ success: false, message: 'AI key not configured' });
  }

  // 1. Updated the prompt text to reflect the supported resolution (1536x1024)
  // Added precautions to prevent unwanted alterations to face, gender, etc.
  let finalPrompt = prompt.trim();
  
  if (image) {
    console.log('[AI ROUTER] image provided, analyzing with GPT-4o vision to merge with prompt...');
    try {
      const gptResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: `You are an expert image generation prompt engineer. I am providing a reference image. First, identify and lock in the core subject's exact gender, race, approximate age, and essential facial features. CRITICAL: You MUST preserve the exact gender of the subject. If the image shows a man, your prompt MUST explicitly describe a man. If it shows a woman, describe a woman. Do NOT change the subject's gender, race, or core identity under ANY circumstances unless the user explicitly asks to change them.
Now, apply the following user edits: "${finalPrompt}".
Return ONLY the final, highly detailed DALL-E prompt that recreates this exact same person (matching their original gender and features) with the user's modifications applied. Do not output conversational text.` },
                { type: 'image_url', image_url: { url: image } }
              ]
            }
          ],
          max_tokens: 400,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (gptResponse.data?.choices?.[0]?.message?.content) {
        finalPrompt = gptResponse.data.choices[0].message.content.trim();
        console.log('[AI ROUTER] Vision derived prompt:', finalPrompt);
      }
    } catch (visionError: any) {
      console.error('[AI ROUTER] Vision analysis failed:', visionError.response?.data || visionError.message);
      // Fallback: just use standard prompt if vision fails
    }
  }

  finalPrompt +=
    ' | IMPORTANT: Generate an exact 16:9 aspect ratio image (1536x1024), with the main subject and all text/content fully visible from left to right, no cropping, no borders, no empty space, fill the frame horizontally. CRITICAL PRECAUTION: Strictly follow the user description exactly. Do NOT alter or change the subject\'s face, gender, race, or other core identifying characteristics unless explicitly requested in the prompt. Do not add random characters or modify the core subject details without instruction.';
  
  if (style || additionalStyle) {
    let stylePart = '';
    if (style) stylePart += `${style} style `;
    if (additionalStyle) stylePart += (stylePart ? `with ${additionalStyle}` : additionalStyle);
    finalPrompt = `Create a ${stylePart} image of ${finalPrompt}`;
  }

  try {
    // 2. FIXED: Changed from '1024x576' to '1536x1024' as required by the API
    const imageSize = '1536x1024';
    
    console.log('[AI ROUTER] sending request', { finalPrompt, count, size: imageSize, model: 'gpt-image-1' });
    
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt: finalPrompt,
        n: count,
        size: imageSize,
        model: 'gpt-image-1', 
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data?.data || [];

    // Map response to handle both URLs and Base64 strings
    const images: string[] = data
      .map((item: any) => {
        if (item.url) return item.url as string;
        if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
        return undefined;
      })
      .filter(Boolean) as string[];

    if (images.length === 0) {
      console.warn('[AI ROUTER] no images extracted from OpenAI response', response.data);
    }

    console.log('[AI ROUTER] generated', images.length, 'images');
    res.json({ success: true, images });

  } catch (error: any) {
    if (error.response) {
      console.error('[AI GENERATION ERROR] status:', error.response.status, 'data:', error.response.data);
      
      // Handle Invalid Size (Double Check)
      if (error.response.status === 400 && error.response.data?.error?.code === 'invalid_value') {
          return res.status(400).json({
              success: false,
              message: 'Invalid size requested. Use 1024x1024, 1536x1024, or 1024x1536.',
              detail: error.response.data.error.message
          });
      }

      // Model Not Found fallback
      if (error.response.status === 403 && error.response.data?.error?.code === 'model_not_found') {
        console.error('Possible invalid model - check your OpenAI project settings.');
        const placeholders = Array(count).fill('https://via.placeholder.com/1536x1024.png?text=API+Model+Error');
        return res.json({ success: true, images: placeholders });
      }

      // Moderation logic
      if (error.response.status === 400 && error.response.data?.error?.code === 'moderation_blocked') {
        return res.status(400).json({
          success: false,
          message: 'Prompt violated content policy. Please try different wording.',
          detail: error.response.data?.error?.message,
        });
      }

      // Rate limit logic
      if (error.response.status === 429) {
        return res.status(429).json({
          success: false,
          message: 'Rate limit exceeded. Please wait a moment.',
        });
      }
    } else {
      console.error('[AI GENERATION ERROR]', error.message);
    }
    
    res.status(500).json({ 
        success: false, 
        message: 'Failed to generate images', 
        error: error.response?.data || error.message 
    });
  }
});

export default router;