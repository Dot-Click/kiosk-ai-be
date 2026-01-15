import swaggerAutogen from "swagger-autogen";

interface SwaggerDoc {
  info: {
    title: string;
    description: string;
    version: string;
    contact?: {
      name?: string;
      email?: string;
    };
  };
  host: string;
  basePath: string;
  schemes: string[];
  consumes: string[];
  produces: string[];
  tags: any[];
  definitions?: any;
}

const doc: SwaggerDoc = {
  info: {
    title: "Time2Clean API",
    description: "Time2Clean API endpoints documentation. This API provides endpoints for QR code generation, image uploads, and user authentication.",
    version: "1.0.0",
    contact: {
      name: "Time2Clean Support",
    },
  },
  host: process.env.HOST || "localhost:5000",
  basePath: "/api/v1",
  schemes: ["http", "https"],
  consumes: ["application/json", "multipart/form-data"],
  produces: ["application/json", "image/jpeg", "image/png", "image/gif"],
  tags: [
    {
      name: "QR Code",
      description: "QR code generation and validation endpoints",
    },
    {
      name: "Upload",
      description: "Image upload and retrieval endpoints",
    },
    {
      name: "Auth",
      description: "Authentication endpoints",
    },
    {
      name: "Health",
      description: "Health check endpoints",
    },
  ],
  definitions: {
    QRGenerateRequest: {
      data: {
        type: "string",
        example: "kiosk-upload",
        description: "Optional data to encode in QR code",
      },
    },
    QRGenerateResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        id: {
          type: "string",
          example: "1768305296192",
        },
        code: {
          type: "string",
          example: "1768305296192",
        },
        url: {
          type: "string",
          example: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=...",
        },
        uploadUrl: {
          type: "string",
          example: "https://kiosk-ai.vercel.app/upload?code=1768305296192",
        },
      },
    },
    QRValidateResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        isValid: {
          type: "boolean",
          example: true,
        },
        code: {
          type: "string",
          example: "1768305296192",
        },
        message: {
          type: "string",
          example: "QR code is valid",
        },
      },
    },
    QRDetailsResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        code: {
          type: "string",
          example: "1768305296192",
        },
        uploadUrl: {
          type: "string",
          example: "https://kiosk-ai.vercel.app/upload?code=1768305296192",
        },
        qrImageUrl: {
          type: "string",
          example: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=...",
        },
        isActive: {
          type: "boolean",
          example: true,
        },
        createdAt: {
          type: "string",
          format: "date-time",
          example: "2024-01-15T10:30:00.000Z",
        },
        expiresAt: {
          type: "string",
          format: "date-time",
          example: "2024-01-15T11:00:00.000Z",
        },
      },
    },
    UploadRequest: {
      code: {
        type: "string",
        required: true,
        example: "1768305296192",
        description: "QR code associated with the upload",
      },
      image: {
        type: "file",
        required: true,
        description: "Image file to upload (JPEG, PNG, GIF, WEBP)",
      },
    },
    UploadResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Image uploaded successfully",
      },
      data: {
        code: {
          type: "string",
          example: "1768305296192",
        },
        imageUrl: {
          type: "string",
          example: "https://kiosk-ai-be-production.up.railway.app/api/v1/upload/image/1768305296192",
        },
        cloudinaryUrl: {
          type: "string",
          example: "https://res.cloudinary.com/...",
        },
        fileName: {
          type: "string",
          example: "image.jpg",
        },
        fileSize: {
          type: "number",
          example: 245678,
        },
        uploadedAt: {
          type: "string",
          format: "date-time",
          example: "2024-01-15T10:30:00.000Z",
        },
      },
    },
    CheckUploadResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        exists: {
          type: "boolean",
          example: true,
        },
        code: {
          type: "string",
          example: "1768305296192",
        },
        imageUrl: {
          type: "string",
          example: "https://kiosk-ai-be-production.up.railway.app/api/v1/upload/image/1768305296192",
        },
        fileName: {
          type: "string",
          example: "image.jpg",
        },
        uploadedAt: {
          type: "string",
          format: "date-time",
          example: "2024-01-15T10:30:00.000Z",
        },
        message: {
          type: "string",
          example: "Image found",
        },
      },
    },
    RegisterRequest: {
      first_name: {
        type: "string",
        required: true,
        example: "John",
        description: "User's first name",
      },
      last_name: {
        type: "string",
        required: true,
        example: "Doe",
        description: "User's last name",
      },
      email: {
        type: "string",
        required: true,
        format: "email",
        example: "john.doe@example.com",
        description: "User's email address",
      },
      password: {
        type: "string",
        required: true,
        example: "Password123!",
        description: "Password must contain at least one uppercase letter, one special character, and one number",
      },
    },
    RegisterResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "User created successfully",
      },
      data: {
        id: {
          type: "string",
          example: "507f1f77bcf86cd799439011",
        },
        first_name: {
          type: "string",
          example: "John",
        },
        last_name: {
          type: "string",
          example: "Doe",
        },
        email: {
          type: "string",
          example: "john.doe@example.com",
        },
      },
    },
    LoginRequest: {
      email: {
        type: "string",
        required: true,
        format: "email",
        example: "john.doe@example.com",
        description: "User's email address",
      },
      password: {
        type: "string",
        required: true,
        example: "Password123!",
        description: "User's password",
      },
    },
    LoginResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Logged in successfully",
      },
      data: {
        jwtToken: {
          type: "string",
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        },
        user: {
          id: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
          first_name: {
            type: "string",
            example: "John",
          },
          last_name: {
            type: "string",
            example: "Doe",
          },
          email: {
            type: "string",
            example: "john.doe@example.com",
          },
        },
      },
    },
    LogoutResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Logged out successfully",
      },
    },
    HealthResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      status: {
        type: "string",
        example: "healthy",
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2024-01-15T10:30:00.000Z",
      },
      uptime: {
        type: "number",
        example: 3600.5,
        description: "Server uptime in seconds",
      },
    },
    ErrorResponse: {
      success: {
        type: "boolean",
        example: false,
      },
      error: {
        type: "string",
        example: "Error message description",
      },
    },
  },
};

const swaggerAutogenInstance = swaggerAutogen();
const outputFile = "./swagger_output.json";
const endpointsFiles = [
  "./src/router/index.ts",
  "./src/router/qr.ts",
  "./src/router/upload.ts",
  "./src/router/auth.ts",
  "./src/app.ts",
];

swaggerAutogenInstance(outputFile, endpointsFiles, doc).then(() => {
  console.log("✅ Swagger documentation generated successfully!");
  console.log("📄 File: swagger_output.json");
  console.log("🌐 Access at: http://localhost:5000/api-docs");
});
