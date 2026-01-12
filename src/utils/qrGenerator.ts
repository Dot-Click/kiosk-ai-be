// import QRCode from 'qrcode';

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

import QRCode from 'qrcode';

interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

class QRGenerator {
  static async generateQRCode(data: string, options?: QRCodeOptions): Promise<string> {
    try {
      const defaultOptions = {
        width: 300,
        margin: 2,
        color: {
          dark: '#2d2d6d',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H' as const,
        ...options
      };

      const qrCodeUrl = await QRCode.toDataURL(data, defaultOptions);
      return qrCodeUrl;
    } catch (error: any) {
      // Type the error parameter properly
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate QR code: ${errorMessage}`);
    }
  }
  static async generateUploadQR(code: string): Promise<{
    code: string;
    qrImageUrl: string;
    uploadUrl: string;
  }> {
    const uploadUrl = `${process.env.FRONTEND_URL}/upload?code=${code}`;
    const qrImageUrl = await this.generateQRCode(uploadUrl);
    
    return {
      code,
      qrImageUrl,
      uploadUrl
    };
  }

}

export default QRGenerator;