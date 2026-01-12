"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUploadCode = exports.uploadSingleImage = void 0;
const ApiError_1 = require("../utils/ApiError");
const multer_1 = require("../config/multer");
const uploadSingleImage = (fieldName) => {
    return (req, res, next) => {
        const uploadMiddleware = multer_1.upload.single(fieldName);
        uploadMiddleware(req, res, (err) => {
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new ApiError_1.ApiError(400, 'File size too large. Maximum 10MB allowed.'));
                }
                if (err.message === 'Invalid file type. Only images are allowed.') {
                    return next(new ApiError_1.ApiError(400, 'Invalid file type. Only images are allowed.'));
                }
                return next(new ApiError_1.ApiError(400, err.message));
            }
            next();
        });
    };
};
exports.uploadSingleImage = uploadSingleImage;
const validateUploadCode = (req, res, next) => {
    const { code } = req.body;
    if (!code || typeof code !== 'string' || code.length !== 6) {
        return next(new ApiError_1.ApiError(400, 'Valid 6-digit code is required'));
    }
    next();
};
exports.validateUploadCode = validateUploadCode;
//# sourceMappingURL=uploadMiddleware.js.map