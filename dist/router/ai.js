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
const router = (0, express_1.Router)();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// Log initialization
console.log('[AI ROUTER] Initialized - Key configured:', !!OPENAI_API_KEY);
/**
 * POST /api/ai/generate
 * Body: { prompt: string, style?: string, count?: number, additionalStyle?: string, image?: base64 }
 */
router.post('/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const { prompt, style, count = 1, additionalStyle, image } = req.body;
    if (!prompt)
        return res.status(400).json({ success: false, message: 'Prompt is required' });
    if (!OPENAI_API_KEY)
        return res.status(500).json({ success: false, message: 'AI Key not set' });
    let finalPrompt = prompt.trim();
    let subjectIdentity = "";
    // STAGE 1: Vision Analysis (Optional)
    if (image) {
        try {
            console.log('[AI ROUTER] Analyzing image for identity...');
            const visionResponse = yield axios_1.default.post('https://api.openai.com/v1/chat/completions', {
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
            }, {
                headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }
            });
            const visionText = ((_e = (_d = (_c = (_b = (_a = visionResponse.data) === null || _a === void 0 ? void 0 : _a.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content) === null || _e === void 0 ? void 0 : _e.trim()) || "REJECT";
            // Robust Refusal Detection
            const refusalWords = ["sorry", "cannot", "assist", "policy", "reject"];
            const isRefusal = refusalWords.some(word => visionText.toLowerCase().includes(word));
            if (!isRefusal && visionText.length > 10) {
                subjectIdentity = visionText;
                console.log('[AI ROUTER] Identity locked:', subjectIdentity);
            }
            else {
                console.warn('[AI ROUTER] Vision refused or failed. Using raw prompt.');
            }
        }
        catch (err) {
            console.error('[AI ROUTER] Vision error - falling back');
        }
    }
    // STAGE 2: Construct Final DALLE Prompt
    // We prioritize the subject's identity, then the style, then the user's modifications.
    let dallePrompt = "";
    if (subjectIdentity) {
        dallePrompt = `A high-quality 1024x1024 photo of ${subjectIdentity}. `;
        dallePrompt += `The person is performing a specific request: ${finalPrompt}. `;
    }
    else {
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
        const response = yield axios_1.default.post('https://api.openai.com/v1/images/generations', {
            prompt: dallePrompt,
            n: count,
            size: '1024x1024',
            model: 'gpt-image-1',
        }, {
            headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }
        });
        const imageResults = (((_f = response.data) === null || _f === void 0 ? void 0 : _f.data) || [])
            .map((item) => item.url || (item.b64_json ? `data:image/png;base64,${item.b64_json}` : null))
            .filter(Boolean);
        res.json({ success: true, images: imageResults });
    }
    catch (error) {
        console.error('[AI GEN ERROR]:', ((_g = error.response) === null || _g === void 0 ? void 0 : _g.data) || error.message);
        res.status(500).json({ success: false, error: 'Generation failed. Try simpler instructions.' });
    }
}));
exports.default = router;
//# sourceMappingURL=ai.js.map