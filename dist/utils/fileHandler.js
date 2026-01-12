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
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class FileHandler {
    static ensureUploadsDirectory() {
        return __awaiter(this, void 0, void 0, function* () {
            const uploadsDir = path_1.default.join(__dirname, '../../uploads/images');
            try {
                yield promises_1.default.access(uploadsDir);
                console.log('✅ Uploads directory already exists');
            }
            catch (_a) {
                yield promises_1.default.mkdir(uploadsDir, { recursive: true });
                console.log('📁 Created uploads directory');
            }
        });
    }
    static deleteFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield promises_1.default.unlink(filePath);
                console.log(`🗑️  Deleted file: ${filePath}`);
            }
            catch (error) {
                console.error(`❌ Failed to delete file: ${filePath}`, error);
            }
        });
    }
    static getFileExtension(filename) {
        return path_1.default.extname(filename).toLowerCase();
    }
    static formatFileSize(bytes) {
        if (bytes < 1024)
            return bytes + ' bytes';
        else if (bytes < 1048576)
            return (bytes / 1024).toFixed(1) + ' KB';
        else
            return (bytes / 1048576).toFixed(1) + ' MB';
    }
}
exports.default = FileHandler;
//# sourceMappingURL=fileHandler.js.map