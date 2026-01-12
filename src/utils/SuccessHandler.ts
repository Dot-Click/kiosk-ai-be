import { Response } from 'express';

export class SuccessHandler {
  static handle(
    res: Response,
    message: string,
    data: any = null,
    statusCode: number = 200
  ): Response {
    const response: any = {
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