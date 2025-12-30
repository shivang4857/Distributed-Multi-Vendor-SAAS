export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details ?: any;

    constructor(message: string, statusCode = 500, isOperational = true, details ?: any) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;

        Error.captureStackTrace(this, this.constructor);
    }
}

// not found error
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found', details ?: any) {
        super(message, 404, true, details);
    }
}

// validation error (used for the validator like joi , zod etc)
export class ValidationError extends AppError {
    constructor(message = 'Validation error', details ?: any) {
        super(message, 400, true, details);
    }
}

// authentication error
export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed', details ?: any) {
        super(message, 401, true, details);
    }
}
//forbidden error
export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', details ?: any) {
        super(message, 403, true, details);
    }
}
//database error
export class DatabaseError extends AppError {
    constructor(message = 'Database error', details ?: any) {
        super(message, 500, false, details);
    }
}

//rate limit error
export class RateLimitError extends AppError {
    constructor(message = 'Too many requests, please try again later.', details ?: any) {
        super(message, 429, true, details);
    }
}