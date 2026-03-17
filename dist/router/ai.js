"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
console.log('[AI ROUTER] module loaded');
const router = (0, express_1.Router)();
// NOTE: for development or quick testing you can hardcode a key here.
// In production you'd normally set process.env.OPENAI_API_KEY instead.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (OPENAI_API_KEY) {
    console.log('[AI ROUTER] using API key length', OPENAI_API_KEY.length);
}
else {
    console.error('[AI ROUTER] WARNING: OPENAI_API_KEY is not set in environment variables!');
}
/**
 * POST /api/ai/generate
 * Body: { prompt: string, style?: string, count?: number, additionalStyle?: string }
 */
router.post('/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    const { prompt, style, count = 4, additionalStyle, image } = req.body;
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
            const gptResponse = yield axios_1.default.post('https://api.openai.com/v1/chat/completions', {
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
            }, {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });
            if ((_d = (_c = (_b = (_a = gptResponse.data) === null || _a === void 0 ? void 0 : _a.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content) {
                finalPrompt = gptResponse.data.choices[0].message.content.trim();
                console.log('[AI ROUTER] Vision derived prompt:', finalPrompt);
            }
        }
        catch (visionError) {
            console.error('[AI ROUTER] Vision analysis failed:', ((_e = visionError.response) === null || _e === void 0 ? void 0 : _e.data) || visionError.message);
            // Fallback: just use standard prompt if vision fails
        }
    }
    finalPrompt +=
        ' | IMPORTANT: Generate an exact 16:9 aspect ratio image (1536x1024), with the main subject and all text/content fully visible from left to right, no cropping, no borders, no empty space, fill the frame horizontally. CRITICAL PRECAUTION: Strictly follow the user description exactly. Do NOT alter or change the subject\'s face, gender, race, or other core identifying characteristics unless explicitly requested in the prompt. Do not add random characters or modify the core subject details without instruction.';
    if (style || additionalStyle) {
        let stylePart = '';
        if (style)
            stylePart += `${style} style `;
        if (additionalStyle)
            stylePart += (stylePart ? `with ${additionalStyle}` : additionalStyle);
        finalPrompt = `Create a ${stylePart} image of ${finalPrompt}`;
    }
    try {
        // 2. FIXED: Changed from '1024x576' to '1536x1024' as required by the API
        const imageSize = '1536x1024';
        console.log('[AI ROUTER] sending request', { finalPrompt, count, size: imageSize, model: 'gpt-image-1' });
        const response = yield axios_1.default.post('https://api.openai.com/v1/images/generations', {
            prompt: finalPrompt,
            n: count,
            size: imageSize,
            model: 'gpt-image-1',
        }, {
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        const data = ((_f = response.data) === null || _f === void 0 ? void 0 : _f.data) || [];
        // Map response to handle both URLs and Base64 strings
        const images = data
            .map((item) => {
            if (item.url)
                return item.url;
            if (item.b64_json)
                return `data:image/png;base64,${item.b64_json}`;
            return undefined;
        })
            .filter(Boolean);
        if (images.length === 0) {
            console.warn('[AI ROUTER] no images extracted from OpenAI response', response.data);
        }
        console.log('[AI ROUTER] generated', images.length, 'images');
        res.json({ success: true, images });
    }
    catch (error) {
        if (error.response) {
            console.error('[AI GENERATION ERROR] status:', error.response.status, 'data:', error.response.data);
            // Handle Invalid Size (Double Check)
            if (error.response.status === 400 && ((_h = (_g = error.response.data) === null || _g === void 0 ? void 0 : _g.error) === null || _h === void 0 ? void 0 : _h.code) === 'invalid_value') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid size requested. Use 1024x1024, 1536x1024, or 1024x1536.',
                    detail: error.response.data.error.message
                });
            }
            // Model Not Found fallback
            if (error.response.status === 403 && ((_k = (_j = error.response.data) === null || _j === void 0 ? void 0 : _j.error) === null || _k === void 0 ? void 0 : _k.code) === 'model_not_found') {
                console.error('Possible invalid model - check your OpenAI project settings.');
                const placeholders = Array(count).fill('https://via.placeholder.com/1536x1024.png?text=API+Model+Error');
                return res.json({ success: true, images: placeholders });
            }
            // Moderation logic
            if (error.response.status === 400 && ((_m = (_l = error.response.data) === null || _l === void 0 ? void 0 : _l.error) === null || _m === void 0 ? void 0 : _m.code) === 'moderation_blocked') {
                return res.status(400).json({
                    success: false,
                    message: 'Prompt violated content policy. Please try different wording.',
                    detail: (_p = (_o = error.response.data) === null || _o === void 0 ? void 0 : _o.error) === null || _p === void 0 ? void 0 : _p.message,
                });
            }
            // Rate limit logic
            if (error.response.status === 429) {
                return res.status(429).json({
                    success: false,
                    message: 'Rate limit exceeded. Please wait a moment.',
                });
            }
        }
        else {
            console.error('[AI GENERATION ERROR]', error.message);
        }
        res.status(500).json({
            success: false,
            message: 'Failed to generate images',
            error: ((_q = error.response) === null || _q === void 0 ? void 0 : _q.data) || error.message
        });
    }
}));
exports.default = router;
//# sourceMappingURL=ai.js.map