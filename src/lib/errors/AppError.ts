export type ErrorCode =
  | "CONFIGURATION_ERROR"
  | "AUTHENTICATION_REQUIRED"
  | "AUTHORIZATION_DENIED"
  | "VALIDATION_FAILED"
  | "STATE_TRANSITION_ILLEGAL"
  | "DATABASE_ERROR"
  | "PAYMENT_GATEWAY_ERROR"
  | "NETWORK_OFFLINE"
  | "RESOURCE_NOT_FOUND"
  | "INTERNAL_ERROR";

/**
 * Base Application Error class for structured handling.
 */
export class AppError extends Error {
  public statusCode: number;
  public errorCode: ErrorCode;
  public userMessage: string;
  public details?: unknown;

  constructor(
    errorCode: ErrorCode,
    userMessage: string,
    statusCode: number = 400,
    details?: unknown
  ) {
    super(`[${errorCode}]: ${userMessage}`);
    this.name = "AppError";
    this.errorCode = errorCode;
    this.userMessage = userMessage;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ConfigurationError extends AppError {
  constructor(service: string, message: string) {
    super(
      "CONFIGURATION_ERROR",
      `External service "${service}" is not properly configured: ${message}`,
      503
    );
    this.name = "ConfigurationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "You do not possess the required permissions to perform this action.") {
    super("AUTHORIZATION_DENIED", message, 403);
    this.name = "AuthorizationError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super("VALIDATION_FAILED", message, 422, details);
    this.name = "ValidationError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super("DATABASE_ERROR", message, 500, details);
    this.name = "DatabaseError";
  }
}

export class NetworkOfflineError extends AppError {
  constructor() {
    super(
      "NETWORK_OFFLINE",
      "Connection lost. Your action has not been confirmed. Please reconnect and retry.",
      0
    );
    this.name = "NetworkOfflineError";
  }
}
