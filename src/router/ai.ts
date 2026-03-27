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

  // STAGE 1: Vision Analysis (Optional)
  if (image) {
    try {
      console.log('[AI ROUTER] Analyzing image for identity...');
      const visionResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this person's identity. 
                         1. Are they a MAN, WOMAN, BOY, or GIRL? (Be 100% sure, check facial features/beard).
                         2. What is their race/ethnicity?
                         3. Describe their hair and key facial features.
                         
                         Return ONLY a 1-sentence description starting with "A [GENDER] [RACE] [AGE] with [FEATURES]...".
                         If you cannot see the person or refuse to answer, return "REJECT".`
                },
                { type: 'image_url', image_url: { url: image } }
              ]
            }
          ],
          max_tokens: 300,
        },
        {
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }
        }
      );

      const visionText = visionResponse.data?.choices?.[0]?.message?.content?.trim() || "REJECT";

      // Robust Refusal Detection
      const refusalWords = ["sorry", "cannot", "assist", "policy", "reject"];
      const isRefusal = refusalWords.some(word => visionText.toLowerCase().includes(word));

      if (!isRefusal && visionText.length > 10) {
        subjectIdentity = visionText;
        console.log('[AI ROUTER] Identity locked:', subjectIdentity);
      } else {
        console.warn('[AI ROUTER] Vision refused or failed. Using raw prompt.');
      }
    } catch (err) {
      console.error('[AI ROUTER] Vision error - falling back');
    }
  }

  // STAGE 2: Construct Final DALLE Prompt
  // We prioritize the subject's identity, then the style, then the user's modifications.
  let dallePrompt = "";

  if (subjectIdentity) {
    dallePrompt = `A high-quality 1024x1024 photo of ${subjectIdentity}. `;
    dallePrompt += `The person is performing a specific request: ${finalPrompt}. `;
  } else {
    dallePrompt = `${finalPrompt}. `;
  }

  // Add Style
  if (style || additionalStyle) {
    const combinedStyle = [style, additionalStyle].filter(Boolean).join(" ");
    dallePrompt += `Render this in a beautiful ${combinedStyle} style. `;
  }

  // Soft constraints that avoid moderation flags
  dallePrompt += `This is a high-resolution, full-frame 1:1 square photo. Please maintain the exact gender and distinctive features of the subject throughout the generation.`;

  try {
    console.log('[AI ROUTER] Generating Image:', { size: '1024x1024', count });

    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt: dallePrompt,
        n: count,
        size: '1024x1024',
        model: 'gpt-image-1',
      },
      {
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }
      }
    );

    const imageResults = (response.data?.data || [])
      .map((item: any) => item.url || (item.b64_json ? `data:image/png;base64,${item.b64_json}` : null))
      .filter(Boolean);

    res.json({ success: true, images: imageResults });

  } catch (error: any) {
    console.error('[AI GEN ERROR]:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Generation failed. Try simpler instructions.' });
  }
});

export default router;