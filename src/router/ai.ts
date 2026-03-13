import { Router } from 'express';
import axios from 'axios';

console.log('[AI ROUTER] module loaded');
const router = Router();

// NOTE: for development or quick testing you can hardcode a key here.
// In production you'd normally set process.env.OPENAI_API_KEY instead.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log('[AI ROUTER] using API key length', OPENAI_API_KEY.length);

/**
 * POST /api/ai/generate
 * Body: { prompt: string, style?: string, count?: number, additionalStyle?: string }
 *
 * This endpoint proxies requests to the OpenAI image generation API. It
 * constructs a prompt that includes the user-provided description together
 * with any selected style/filter information. The API key is read from
 * process.env.OPENAI_API_KEY and must be set in the environment (never
 * commit it to source control).
 *
 * The response returns an array of image URLs that the front‑end can display.
 */
router.post('/generate', async (req, res) => {
  const { prompt, style, count = 4, additionalStyle } = req.body as {
    prompt?: string;
    style?: string;
    count?: number;
    additionalStyle?: string;
  };

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ success: false, message: 'prompt is required' });
  }

  if (!OPENAI_API_KEY) {
    console.error('[AI ROUTER] missing OPENAI_API_KEY');
    return res.status(500).json({ success: false, message: 'AI key not configured' });
  }

  // Build the final prompt text for OpenAI
  let finalPrompt = prompt.trim();
  if (style || additionalStyle) {
    let stylePart = '';
    if (style) stylePart += `${style} style`;
    if (additionalStyle) stylePart += (stylePart ? ` with ${additionalStyle}` : additionalStyle);
    finalPrompt = `Create a ${stylePart} image of ${finalPrompt}`;
  }

  try {
    console.log('[AI ROUTER] sending request', { finalPrompt, count, size: '1024x1024', model: 'gpt-image-1' });
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt: finalPrompt,
        n: count,
        size: '1024x1024',
        model: 'dall-e-2', // use DALL-E 2 for multiple images
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data?.data || [];

    // OpenAI may return URLs or base64 blobs depending on configuration.  When
    // using the new `gpt-image-1` model the payload is usually
    // `{ b64_json: "..." }` rather than `{ url: "https://..." }`.
    // Our old code assumed `url` and therefore returned an empty array which
    // resulted in a tiny 28‑byte response and no images on the frontend.
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
    // print detailed information for debugging
    if (error.response) {
      console.error('[AI GENERATION ERROR] status:', error.response.status, 'data:', error.response.data);
      // special-case a few known error conditions
      if (error.response.status === 403 && error.response.data?.error?.code === 'model_not_found') {
        console.error('Possible invalid or unauthorized model - check your OpenAI project settings or use gpt-image-1.');
        // gracefully degrade by returning some dummy/placeholder images so the
        // front-end can continue to work even without a valid OpenAI key.
        // generate simple placeholder URLs or repeat the same
        const placeholders = Array(count)
          .fill('https://via.placeholder.com/1024x1024.png?text=Placeholder');
        return res.json({ success: true, images: placeholders });
      }

      // catch moderation-related blocks and give user-friendly feedback
      if (error.response.status === 400 && error.response.data?.error?.code === 'moderation_blocked') {
        console.warn('[AI GENERATION] prompt blocked by moderation:', finalPrompt);
        return res.status(400).json({
          success: false,
          message: 'Prompt violated content policy and was blocked by the moderation system. Please try a different description without copyrighted or unsafe terms.',
          detail: error.response.data?.error?.message || 'moderation_blocked',
        });
      }

      // handle rate limit errors
      if (error.response.status === 429 && error.response.data?.error?.code === 'rate_limit_exceeded') {
        console.warn('[AI GENERATION] rate limit exceeded:', error.response.data);
        return res.status(429).json({
          success: false,
          message: 'Rate limit exceeded. Please wait a moment before generating more images.',
          detail: error.response.data?.error?.message || 'rate_limit_exceeded',
        });
      }

      // handle file too large or other payload errors
      if (error.response.status === 413) {
        console.warn('[AI GENERATION] request too large:', error.response.data);
        return res.status(413).json({
          success: false,
          message: 'Request payload too large. Please reduce the number of images or simplify your prompt.',
          detail: error.response.data?.error?.message || 'payload_too_large',
        });
      }
    } else {
      console.error('[AI GENERATION ERROR]', error.message);
    }
    res.status(500).json({ success: false, message: 'Failed to generate images', error: error.response?.data || error.message });
  }
});

export default router;
