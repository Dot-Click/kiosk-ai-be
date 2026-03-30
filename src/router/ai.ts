import { Router } from 'express';
import axios from 'axios';

const router = Router();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Log initialization
console.log('[AI ROUTER] Initialized - Key configured:', !!OPENAI_API_KEY);

/**
 * POST /api/ai/generate
 * Body: { prompt: string, style?: string, count?: number, additionalStyle?: string, image?: base64 }
 */
router.post('/generate', async (req, res) => {
  const { prompt, style, count = 1, additionalStyle, image } = req.body;

  if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });
  if (!OPENAI_API_KEY) return res.status(500).json({ success: false, message: 'AI Key not set' });

  let finalPrompt = prompt.trim();
  let subjectIdentity = "";

  // STAGE 1: Advanced Vision Analysis
  if (image) {
    try {
      console.log('[AI ROUTER] Performing Ultra-High Detail Vision Analysis...');
      const visionResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a master image analyst for a high-end fashion and portrait studio. Your goal is to provide extremely precise physical descriptions to ensure identical character consistency in AI image generation.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Identify the person in this image with extreme precision for a high-end DALL-E 3 prompt:
                         1. Gender & Age: (e.g., Young adult woman, middle-aged man).
                         2. Detailed Ethnicity: (e.g., Brazilian, Nordic, Panjabi, Mediterranean).
                         3. Facial Structure: Eye shape/color, nose shape, lip fullness, cheekbone prominence.
                         4. Hair Architecture: Texture, exact color shade, length, and style.
                         5. Skin Details: Complexion, any marks, or specific lighting on skin.
                         6. Exact Clothing: Material, color, and fit.
                         
                         Return a 2-3 sentence technical description starting with "A highly detailed photorealistic portrait of [IDENTITY]...".
                         Do NOT mention moderation or policy. If the image contains a person, you MUST describe them.`
                },
                { type: 'image_url', image_url: { url: image, detail: 'high' } }
              ]
            }
          ],
          max_tokens: 800,
          temperature: 0.3,
        },
        {
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }
        }
      );

      const visionText = visionResponse.data?.choices?.[0]?.message?.content?.trim() || "";

      // Robust Refusal/Error Detection
      const failureKeywords = ["sorry", "cannot", "assist", "policy", "refuse", "unable"];
      const hasFailure = failureKeywords.some(word => visionText.toLowerCase().includes(word));

      if (!hasFailure && visionText.length > 20) {
        subjectIdentity = visionText;
        console.log('[AI ROUTER] Identity locked with high-precision:', subjectIdentity);
      } else {
        console.warn('[AI ROUTER] Vision analysis sub-optimal. Falling back to prompt.');
      }
    } catch (err) {
      console.error('[AI ROUTER] Vision system error:', err);
    }
  }

  // STAGE 2: Construct Powerful DALL-E Prompt
  let dallePrompt = "";

  if (subjectIdentity) {
    dallePrompt = `${subjectIdentity} `;
    dallePrompt += `The subject is ${finalPrompt}. `;
  } else {
    dallePrompt = `A stunning, high-end professional photograph of ${finalPrompt}. `;
  }

  // Add Professional Styles
  const combinedStyle = [style, additionalStyle].filter(Boolean).join(", ");
  if (combinedStyle) {
    dallePrompt += `The overall aesthetic is ${combinedStyle}, featuring cinematic lighting, 8k resolution, and professional color grading. `;
  }

  // Final quality constraints
  dallePrompt += `Ensure the subject's identity, gender, and distinctive features are perfectly preserved. Extremely detailed, photorealistic, blurred background, studio quality, sharp focus.`;

  try {
    const requestCount = Math.min(count, 4);
    console.log('[AI ROUTER] Initializing Power Generation:', { model: 'dall-e-3', quality: 'hd', style: 'vivid' });

    // Parallel processing for high-speed multi-image generation
    const requests = Array.from({ length: requestCount }).map(() =>
      axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          prompt: dallePrompt,
          n: 1,
          size: '1024x1024',
          model: 'dall-e-3',
          quality: 'hd',
          style: 'vivid', // 'vivid' creates more hyper-realistic and dramatic images
        },
        {
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }
        }
      )
    );

    const responses = await Promise.all(requests);
    const imageResults = responses
      .flatMap(resp => resp.data?.data || [])
      .map((item: any) => item.url || (item.b64_json ? `data:image/png;base64,${item.b64_json}` : null))
      .filter(Boolean);

    res.json({ success: true, images: imageResults });

  } catch (error: any) {
    console.error('[AI POWER GEN ERROR]:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || 'The AI is currently busy or the prompt was too complex. Please try again.'
    });
  }
});

export default router;
