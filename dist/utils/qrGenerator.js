"use strict";
// import QRCode from 'qrcode';
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
// class QRGenerator {
//   static async generateQRCode(data: string, options?: any): Promise<string> {
//     try {
//       const defaultOptions = {
//         width: 300,
//         margin: 2,
//         color: {
//           dark: '#2d2d6d',
//           light: '#ffffff'
//         },
//         ...options
//       };
//       const qrCodeUrl = await QRCode.toDataURL(data, defaultOptions);
//       return qrCodeUrl;
//     } catch (error) {
//       throw new Error(`Failed to generate QR code: ${error}`);
//     }
//   }
//   static async generateUploadQR(code: string): Promise<{
//     code: string;
//     qrImageUrl: string;
//     uploadUrl: string;
//   }> {
//     const uploadUrl = `${process.env.FRONTEND_URL}/upload?code=${code}`;
//     const qrImageUrl = await this.generateQRCode(uploadUrl);
//     return {
//       code,
//       qrImageUrl,
//       uploadUrl
//     };
//   }
// }
// export default QRGenerator;
const qrcode_1 = __importDefault(require("qrcode"));
class QRGenerator {
    static generateQRCode(data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const defaultOptions = Object.assign({ width: 300, margin: 2, color: {
                        dark: '#2d2d6d',
                        light: '#ffffff'
                    }, errorCorrectionLevel: 'H' }, options);
                const qrCodeUrl = yield qrcode_1.default.toDataURL(data, defaultOptions);
                return qrCodeUrl;
            }
            catch (error) {
                // Type the error parameter properly
                const errorMessage = error instanceof Error ? error.message : String(error);
                throw new Error(`Failed to generate QR code: ${errorMessage}`);
            }
        });
    }
    static generateUploadQR(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const uploadUrl = `${process.env.FRONTEND_URL}/upload?code=${code}`;
            const qrImageUrl = yield this.generateQRCode(uploadUrl);
            return {
                code,
                qrImageUrl,
                uploadUrl
            };
        });
    }
}
exports.default = QRGenerator;
//# sourceMappingURL=qrGenerator.js.map