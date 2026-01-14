import { Request, Response, NextFunction } from 'express';

export const imageCorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // For images, we need more permissive CORS
  const allowedImageOrigins = [
    'https://kiosk-ai.vercel.app',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  
  if (origin && allowedImageOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For images, sometimes we need to allow all
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  // Critical headers for images
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Timing-Allow-Origin', '*');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};