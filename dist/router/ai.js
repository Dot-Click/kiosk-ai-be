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
router.post('/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const { prompt, style, count = 4, additionalStyle } = req.body;
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
        if (style)
            stylePart += `${style} style`;
        if (additionalStyle)
            stylePart += (stylePart ? ` with ${additionalStyle}` : additionalStyle);
        finalPrompt = `Create a ${stylePart} image of ${finalPrompt}`;
    }
    try {
        console.log('[AI ROUTER] sending request', { finalPrompt, count, size: '1024x1024', model: 'gpt-image-1' });
        const response = yield axios_1.default.post('https://api.openai.com/v1/images/generations', {
            prompt: finalPrompt,
            n: count,
            size: '1024x1024',
            model: 'dall-e-2', // use DALL-E 2 for multiple images
        }, {
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        const data = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || [];
        // OpenAI may return URLs or base64 blobs depending on configuration.  When
        // using the new `gpt-image-1` model the payload is usually
        // `{ b64_json: "..." }` rather than `{ url: "https://..." }`.
        // Our old code assumed `url` and therefore returned an empty array which
        // resulted in a tiny 28‑byte response and no images on the frontend.
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
        // print detailed information for debugging
        if (error.response) {
            console.error('[AI GENERATION ERROR] status:', error.response.status, 'data:', error.response.data);
            // special-case a few known error conditions
            if (error.response.status === 403 && ((_c = (_b = error.response.data) === null || _b === void 0 ? void 0 : _b.error) === null || _c === void 0 ? void 0 : _c.code) === 'model_not_found') {
                console.error('Possible invalid or unauthorized model - check your OpenAI project settings or use gpt-image-1.');
                // gracefully degrade by returning some dummy/placeholder images so the
                // front-end can continue to work even without a valid OpenAI key.
                // generate simple placeholder URLs or repeat the same
                const placeholders = Array(count)
                    .fill('https://via.placeholder.com/1024x1024.png?text=Placeholder');
                return res.json({ success: true, images: placeholders });
            }
            // catch moderation-related blocks and give user-friendly feedback
            if (error.response.status === 400 && ((_e = (_d = error.response.data) === null || _d === void 0 ? void 0 : _d.error) === null || _e === void 0 ? void 0 : _e.code) === 'moderation_blocked') {
                console.warn('[AI GENERATION] prompt blocked by moderation:', finalPrompt);
                return res.status(400).json({
                    success: false,
                    message: 'Prompt violated content policy and was blocked by the moderation system. Please try a different description without copyrighted or unsafe terms.',
                    detail: ((_g = (_f = error.response.data) === null || _f === void 0 ? void 0 : _f.error) === null || _g === void 0 ? void 0 : _g.message) || 'moderation_blocked',
                });
            }
            // handle rate limit errors
            if (error.response.status === 429 && ((_j = (_h = error.response.data) === null || _h === void 0 ? void 0 : _h.error) === null || _j === void 0 ? void 0 : _j.code) === 'rate_limit_exceeded') {
                console.warn('[AI GENERATION] rate limit exceeded:', error.response.data);
                return res.status(429).json({
                    success: false,
                    message: 'Rate limit exceeded. Please wait a moment before generating more images.',
                    detail: ((_l = (_k = error.response.data) === null || _k === void 0 ? void 0 : _k.error) === null || _l === void 0 ? void 0 : _l.message) || 'rate_limit_exceeded',
                });
            }
            // handle file too large or other payload errors
            if (error.response.status === 413) {
                console.warn('[AI GENERATION] request too large:', error.response.data);
                return res.status(413).json({
                    success: false,
                    message: 'Request payload too large. Please reduce the number of images or simplify your prompt.',
                    detail: ((_o = (_m = error.response.data) === null || _m === void 0 ? void 0 : _m.error) === null || _o === void 0 ? void 0 : _o.message) || 'payload_too_large',
                });
            }
        }
        else {
            console.error('[AI GENERATION ERROR]', error.message);
        }
        res.status(500).json({ success: false, message: 'Failed to generate images', error: ((_p = error.response) === null || _p === void 0 ? void 0 : _p.data) || error.message });
    }
}));
exports.default = router;
//# sourceMappingURL=ai.js.map