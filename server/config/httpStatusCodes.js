const httpStatusCodes = {
    OK: 200,
    OK_ALT: 201, // CREATED
    OK_ALT_2: 220, 
    OK_ALT_3: 202, // ACCEPTED
    NOT_VERIFIED: 303,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN:403, 
    NOT_FOUND: 404,
    PROXY_AUTHENTICATION_REQUIRED: 407,
    DATA_ALREADY_EXISTS: 409, // CONFLICT
    PRECONDITION_FAILED: 412,
    REQUEST_TOO_LONG: 413,
    REQUEST_URI_TOO_LONG: 414,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    VALIDATION_ERROR: 422,
    INTERNAL_SERVER: 500, 
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    EXTERNAL_SERVICE_ERROR: 503,
    GATEWAY_TIMEOUT: 504,
    CONFLICT:409,
};

export default httpStatusCodes;