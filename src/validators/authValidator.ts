// import { Request, Response, NextFunction } from "express";
// import validator from "validator";
// import ErrorHandler from "../utils/ErrorHandler";

// const validateAuth = (type: string) => (req: Request, res: Response, next: NextFunction) => {
//   const { first_name, last_name, email, password } = req.body;

//   if (!first_name && type === "register") {
//     return ErrorHandler("First name is required", 400, req, res);
//   }

//   if (!last_name && type === "register") {
//     return ErrorHandler("Last name is required", 400, req, res);
//   }

//   if (!email) {
//     return ErrorHandler("Email is required", 400, req, res);
//   }

//   if (!password) {
//     return ErrorHandler("Password is required", 400, req, res);
//   }

//   if (!validator.isEmail(email)) {
//     return ErrorHandler("Invalid email", 400, req, res);
//   }

//   next();
// };

// export { validateAuth };


import { Request, Response, NextFunction } from "express";
import validator from "validator";
import { ErrorHandler } from "../utils/ErrorHandler";

const validateAuth = (type: string) => (req: Request, res: Response, next: NextFunction) => {
  const { first_name, last_name, email, password } = req.body;

  // Validation for register
  if (type === "register") {
    if (!first_name || first_name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "First name is required"
      });
    }

    if (!last_name || last_name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Last name is required"
      });
    }
  }

  // Common validation for both login and register
  if (!email || email.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format"
    });
  }

  if (!password || password.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Password is required"
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long"
    });
  }

  next();
};

export { validateAuth };