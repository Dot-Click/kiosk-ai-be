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
  securityDefinitions?: any;
}

const doc: SwaggerDoc = {
  info: {
    title: "Kiosk AI API",
    description: "Kiosk AI Backend API. Covers Health, QR codes, Upload, Payment (Stripe), Products, and Admin (auth, orders, dashboard, settings, Stripe settings).",
    version: "1.0.0",
    contact: {
      name: "Kiosk AI Support",
    },
  },
  host: process.env.HOST || "localhost:5000",
  basePath: "/api",
  schemes: ["http", "https"],
  consumes: ["application/json", "multipart/form-data"],
  produces: ["application/json", "image/jpeg", "image/png", "image/gif"],
  securityDefinitions: {
    Bearer: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "Enter your JWT token in the format: Bearer {token}",
    },
  },
  tags: [
    { name: "Health", description: "Health check and service status" },
    { name: "QR Code", description: "QR code generation, validation, and details" },
    { name: "Upload", description: "Image upload, check status, and image retrieval" },
    { name: "Payment", description: "Stripe config and create payment intent (checkout)" },
    { name: "Products", description: "Product create and list" },
    { name: "Admin - Auth", description: "Admin login and authentication" },
    { name: "Admin - Orders", description: "List orders and get order details" },
    { name: "Admin - Dashboard", description: "Dashboard statistics" },
    { name: "Admin - Settings", description: "Profile, password, and site settings" },
    { name: "Admin - Stripe Settings", description: "Stripe keys and test connection" },
    { name: "Auth", description: "Authentication endpoints (legacy)" },
    { name: "AI", description: "Prompt-to-image generation endpoints" },
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
    AIGenerateRequest: {
      prompt: {
        type: "string",
        required: true,
        description: "Text description for the image generation",
        example: "A cute puppy playing in a field",
      },
      style: {
        type: "string",
        required: false,
        description: "Chosen AI style (e.g. caricature, anime)",
      },
      additionalStyle: {
        type: "string",
        required: false,
        description: "Optional filter/secondary style identifier",
      },
      count: {
        type: "integer",
        required: false,
        example: 4,
      },
    },
    AIGenerateResponse: {
      success: { type: "boolean", example: true },
      images: {
        type: "array",
        items: { type: "string", example: "https://..." },
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
    AdminLoginRequest: {
      email: {
        type: "string",
        required: true,
        format: "email",
        example: "admin@example.com",
        description: "Admin email address",
      },
      password: {
        type: "string",
        required: true,
        example: "Admin123!",
        description: "Admin password",
      },
    },
    AdminLoginResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Admin logged in successfully",
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
            example: "Admin",
          },
          last_name: {
            type: "string",
            example: "User",
          },
          email: {
            type: "string",
            example: "admin@example.com",
          },
        },
      },
    },
    DashboardStatsResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Dashboard stats retrieved",
      },
      data: {
        totalOrders: {
          type: "number",
          example: 150,
        },
        totalPayments: {
          type: "number",
          example: 12500,
        },
        pendingOrders: {
          type: "number",
          example: 25,
        },
        completedOrders: {
          type: "number",
          example: 125,
        },
      },
    },
    UpdateProfileRequest: {
      firstName: {
        type: "string",
        required: false,
        example: "John",
        description: "Admin's first name",
      },
      lastName: {
        type: "string",
        required: false,
        example: "Doe",
        description: "Admin's last name",
      },
      email: {
        type: "string",
        required: false,
        format: "email",
        example: "admin@example.com",
        description: "Admin's email address",
      },
    },
    UpdateProfileResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Profile updated successfully",
      },
      data: {
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
            example: "admin@example.com",
          },
        },
      },
    },
    ChangePasswordRequest: {
      currentPassword: {
        type: "string",
        required: true,
        example: "OldPassword123!",
        description: "Current password",
      },
      newPassword: {
        type: "string",
        required: true,
        example: "NewPassword123!",
        description: "New password (minimum 6 characters)",
      },
    },
    ChangePasswordResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Password changed successfully",
      },
      data: {
        type: "object",
        example: {},
      },
    },
    UpdateSiteSettingsRequest: {
      siteName: {
        type: "string",
        required: false,
        example: "My Kiosk Store",
        description: "Site name",
      },
      siteUrl: {
        type: "string",
        required: false,
        format: "url",
        example: "https://example.com",
        description: "Site URL",
      },
    },
    UpdateSiteSettingsResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Site settings updated successfully",
      },
      data: {
        siteName: {
          type: "string",
          example: "My Kiosk Store",
        },
        siteUrl: {
          type: "string",
          example: "https://example.com",
        },
      },
    },
    GetOrdersResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Orders retrieved",
      },
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "507f1f77bcf86cd799439011",
            },
            orderNumber: {
              type: "string",
              example: "ORD-001",
            },
            customerName: {
              type: "string",
              example: "John Doe",
            },
            customerEmail: {
              type: "string",
              example: "john@example.com",
            },
            totalAmount: {
              type: "number",
              example: 49.99,
            },
            status: {
              type: "string",
              enum: ["pending", "processing", "shipped", "delivered", "completed", "cancelled"],
              example: "pending",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00.000Z",
            },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productName: {
                    type: "string",
                    example: "Custom T-Shirt",
                  },
                  quantity: {
                    type: "number",
                    example: 1,
                  },
                  price: {
                    type: "number",
                    example: 49.99,
                  },
                },
              },
            },
          },
        },
      },
    },
    GetOrderDetailsResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Order details retrieved",
      },
      data: {
        _id: {
          type: "string",
          example: "507f1f77bcf86cd799439011",
        },
        orderNumber: {
          type: "string",
          example: "ORD-001",
        },
        customerName: {
          type: "string",
          example: "John Doe",
        },
        customerEmail: {
          type: "string",
          example: "john@example.com",
        },
        totalAmount: {
          type: "number",
          example: 49.99,
        },
        status: {
          type: "string",
          enum: ["pending", "processing", "shipped", "delivered", "completed", "cancelled"],
          example: "pending",
        },
        createdAt: {
          type: "string",
          format: "date-time",
          example: "2024-01-15T10:30:00.000Z",
        },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              productName: {
                type: "string",
                example: "Custom T-Shirt",
              },
              quantity: {
                type: "number",
                example: 1,
              },
              price: {
                type: "number",
                example: 49.99,
              },
            },
          },
        },
        shippingAddress: {
          type: "object",
          properties: {
            street: {
              type: "string",
              example: "123 Main St",
            },
            city: {
              type: "string",
              example: "New York",
            },
            state: {
              type: "string",
              example: "NY",
            },
            zip: {
              type: "string",
              example: "10001",
            },
            country: {
              type: "string",
              example: "India",
            },
          },
        },
      },
    },
    StripeSettingsResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Stripe settings retrieved",
      },
      data: {
        _id: {
          type: "string",
          example: "507f1f77bcf86cd799439011",
        },
        publishableKey: {
          type: "string",
          example: "pk_test_...",
        },
        secretKey: {
          type: "string",
          example: "sk_test_...",
          description: "Masked secret key (only last 4 characters visible)",
        },
        webhookSecret: {
          type: "string",
          example: "whsec_...",
          description: "Masked webhook secret (only last 4 characters visible)",
        },
        isActive: {
          type: "boolean",
          example: true,
        },
        currency: {
          type: "string",
          example: "INR",
        },
        updatedAt: {
          type: "string",
          format: "date-time",
          example: "2024-01-15T10:30:00.000Z",
        },
      },
    },
    UpdateStripeSettingsRequest: {
      publishableKey: {
        type: "string",
        required: false,
        example: "pk_test_...",
        description: "Stripe publishable key",
      },
      secretKey: {
        type: "string",
        required: false,
        example: "sk_test_...",
        description: "Stripe secret key",
      },
      webhookSecret: {
        type: "string",
        required: false,
        example: "whsec_...",
        description: "Stripe webhook secret",
      },
      isActive: {
        type: "boolean",
        required: false,
        example: true,
        description: "Whether Stripe is active",
      },
      currency: {
        type: "string",
        required: false,
        example: "INR",
        description: "Default currency",
      },
    },
    TestStripeConnectionResponse: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Stripe connection test successful",
      },
      data: {
        connected: {
          type: "boolean",
          example: true,
        },
        accountId: {
          type: "string",
          example: "acct_...",
        },
        accountEmail: {
          type: "string",
          example: "account@example.com",
        },
      },
    },
    StripeConfigResponse: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Stripe config retrieved" },
      data: {
        publishableKey: { type: "string", example: "pk_test_..." },
        currency: { type: "string", example: "usd" },
        isActive: { type: "boolean", example: true },
      },
    },
    CreatePaymentIntentRequest: {
      amountInCents: { type: "number", required: true, example: 2999, description: "Amount in cents" },
      metadata: { type: "object", description: "Optional key-value metadata (e.g. quantity, fulfillment)" },
    },
    CreatePaymentIntentResponse: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Payment intent created" },
      data: { clientSecret: { type: "string", example: "pi_..._secret_..." } },
    },
    ProductCreateRequest: {
      name: { type: "string", example: "Custom Mug" },
      price: { type: "number", example: 29.99 },
      description: { type: "string", example: "Custom AI mug print" },
    },
    ProductListResponse: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Products retrieved" },
      data: { type: "array", items: { type: "object" } },
    },
  },
};

const swaggerAutogenInstance = swaggerAutogen();
const outputFile = "./swagger_output.json";
const endpointsFiles = [
  "./src/app.ts",
  "./src/router/index.ts",
  "./src/router/qr.ts",
  "./src/router/upload.ts",
  "./src/router/auth.ts",
  "./src/router/admin.ts",
  "./src/router/stripeSettings.ts",
  "./src/router/payment.ts",
  "./src/router/product.ts",
];

swaggerAutogenInstance(outputFile, endpointsFiles, doc).then(() => {
  console.log("✅ Swagger documentation generated successfully!");
  console.log("📄 File: swagger_output.json");
  console.log("🌐 Access at: http://localhost:5000/api-docs");
});
