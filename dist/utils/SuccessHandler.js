"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessHandler = void 0;
class SuccessHandler {
    static handle(res, message, data = null, statusCode = 200) {
        const response = {
            success: true,
            message,
            timestamp: new Date().toISOString()
        };
        if (data) {
            response.data = data;
        }
        return res.status(statusCode).json(response);
    }
}
exports.SuccessHandler = SuccessHandler;
//# sourceMappingURL=SuccessHandler.js.map