// Common error messages
export const errorMessages = {
    NOT_FOUND: 'The requested resource was not found',
    UNAUTHORIZED: 'You are not authorized to access this resource',
    FORBIDDEN: 'You do not have permission to perform this action',
    BAD_REQUEST: 'Invalid request parameters',
    SERVER_ERROR: 'An unexpected error occurred'
};

// Common error status codes
export const statusCodes = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
};

// Helper function to create error objects
export const createError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// Async handler wrapper to catch errors in async routes
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Validation error handler
export const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return createError(400, message);
};

// Duplicate key error handler
export const handleDuplicateKeyError = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return createError(400, message);
};

// Cast error handler (invalid MongoDB ObjectId)
export const handleCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return createError(400, message);
}; 