// import mongoose, { Schema, Document, Model } from 'mongoose';

// export interface IQRCode extends Document {
//   code: string;
//   qrImageUrl: string;
//   uploadUrl: string;
//   isActive: boolean;
//   expiresAt: Date;
//   createdAt: Date;
//   updatedAt: Date;
// }

// interface QRCodeModel extends Model<IQRCode> {
//   generateQR(): Promise<IQRCode>;
//   validateQR(code: string): Promise<boolean>;
//   deactivateQR(code: string): Promise<IQRCode | null>;
// }

// const QRCodeSchema: Schema = new Schema({
//   code: {
//     type: String,
//     required: [true, 'Code is required'],
//     unique: true,
//     trim: true,
//     minlength: [6, 'Code must be 6 digits'],
//     maxlength: [6, 'Code must be 6 digits'],
//     match: [/^\d{6}$/, 'Code must be 6 digits']
//   },
//   qrImageUrl: {
//     type: String,
//     required: [true, 'QR image URL is required']
//   },
//   uploadUrl: {
//     type: String,
//     required: [true, 'Upload URL is required']
//   },
//   isActive: {
//     type: Boolean,
//     default: true,
//     index: true
//   },
//   expiresAt: {
//     type: Date,
//     default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour
//     index: true
//   }
// }, {
//   timestamps: true
// });

// // Indexes
// QRCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// QRCodeSchema.index({ code: 1, isActive: 1 });
// QRCodeSchema.index({ createdAt: -1 });

// // Static method to generate new QR code
// QRCodeSchema.statics.generateQR = async function(): Promise<IQRCode> {
//   const QRCodeGenerator = require('qrcode');
//   const code = Math.floor(100000 + Math.random() * 900000).toString();
  
//   // CRITICAL FIX: Use FRONTEND_URL from .env
//   const frontendUrl = process.env.FRONTEND_URL || 'https://kiosk-ai.vercel.app';
//   const uploadUrl = `${frontendUrl}/upload?code=${code}`;
  
//   console.log('🔗 Generating QR with:', {
//     code,
//     frontendUrl,
//     uploadUrl
//   });

//   const qrImageUrl = await QRCodeGenerator.toDataURL(uploadUrl, {
//     width: parseInt(process.env.QR_CODE_SIZE || '300'),
//     margin: parseInt(process.env.QR_CODE_MARGIN || '2'),
//     color: {
//       dark: process.env.QR_CODE_DARK_COLOR || '#2d2d6d',
//       light: process.env.QR_CODE_LIGHT_COLOR || '#ffffff'
//     },
//     errorCorrectionLevel: 'H'
//   });

//   const qrCode = await this.create({
//     code,
//     qrImageUrl,
//     uploadUrl,
//     isActive: true,
//     expiresAt: new Date(Date.now() + (parseInt(process.env.QR_CODE_EXPIRE_MINUTES || '60') * 60 * 1000))
//   });

//   console.log('✅ QR Code generated:', code);
//   return qrCode;
// };

// QRCodeSchema.statics.validateQR = async function(code: string): Promise<boolean> {
//   const qrCode = await this.findOne({ 
//     code, 
//     isActive: true,
//     expiresAt: { $gt: new Date() }
//   });
//   return !!qrCode;
// };

// QRCodeSchema.statics.deactivateQR = async function(code: string): Promise<IQRCode | null> {
//   return this.findOneAndUpdate(
//     { code },
//     { isActive: false },
//     { new: true }
//   );
// };

// export default mongoose.model<IQRCode, QRCodeModel>('QRCode', QRCodeSchema);



import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQRCode extends Document {
  code: string;
  qrImageUrl: string;
  uploadUrl: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface QRCodeModel extends Model<IQRCode> {
  generateQR(): Promise<IQRCode>;
  validateQR(code: string): Promise<boolean>;
  deactivateQR(code: string): Promise<IQRCode | null>;
}

const QRCodeSchema: Schema = new Schema({
  code: {
    type: String,
    required: [true, 'Code is required'],
    unique: true,
    trim: true,
    // REMOVE 6-digit restriction to allow timestamp-based codes
    // minlength: [6, 'Code must be 6 digits'],
    // maxlength: [6, 'Code must be 6 digits'],
    // match: [/^\d{6}$/, 'Code must be 6 digits'],
    index: true
  },
  qrImageUrl: {
    type: String,
    required: [true, 'QR image URL is required']
  },
  uploadUrl: {
    type: String,
    required: [true, 'Upload URL is required']
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    index: true
  }
}, {
  timestamps: true
});

// Indexes
QRCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
QRCodeSchema.index({ code: 1, isActive: 1 });
QRCodeSchema.index({ createdAt: -1 });

// Static method to generate new QR code - FIXED
QRCodeSchema.statics.generateQR = async function(): Promise<IQRCode> {
  const QRCodeGenerator = require('qrcode');
  
  // FIX: Use timestamp instead of random 6 digits for compatibility
  const code = Date.now().toString(); // Full timestamp
  
  // CRITICAL FIX: Make sure upload URL points to your frontend
  const frontendUrl = process.env.FRONTEND_URL || 'https://kiosk-ai.vercel.app';
  const uploadUrl = `${frontendUrl}/upload?code=${code}`;
  
  console.log('🔗 Generating QR with:', {
    code,
    frontendUrl,
    uploadUrl
  });

  // Generate QR code that points to the upload page
  const qrImageUrl = await QRCodeGenerator.toDataURL(uploadUrl, {
    width: parseInt(process.env.QR_CODE_SIZE || '300'),
    margin: parseInt(process.env.QR_CODE_MARGIN || '2'),
    color: {
      dark: process.env.QR_CODE_DARK_COLOR || '#2d2d6d',
      light: process.env.QR_CODE_LIGHT_COLOR || '#ffffff'
    },
    errorCorrectionLevel: 'H'
  });

  // Also generate external QR URL for compatibility
  const externalQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uploadUrl)}`;

  const qrCode = await this.create({
    code,
    qrImageUrl, // Internal QR code
    uploadUrl,  // This is what the QR code points to
    isActive: true,
    expiresAt: new Date(Date.now() + (parseInt(process.env.QR_CODE_EXPIRE_MINUTES || '30') * 60 * 1000)) // 30 minutes
  });

  console.log('✅ QR Code generated:', code);
  console.log('📱 QR Points to:', uploadUrl);
  
  return qrCode;
};

QRCodeSchema.statics.validateQR = async function(code: string): Promise<boolean> {
  const qrCode = await this.findOne({ 
    code, 
    isActive: true,
    expiresAt: { $gt: new Date() }
  });
  return !!qrCode;
};

QRCodeSchema.statics.deactivateQR = async function(code: string): Promise<IQRCode | null> {
  return this.findOneAndUpdate(
    { code },
    { isActive: false },
    { new: true }
  );
};

export default mongoose.model<IQRCode, QRCodeModel>('QRCode', QRCodeSchema);