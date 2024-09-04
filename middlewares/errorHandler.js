const errorMessages = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    // Add more custom messages as needed
};

function errorHandler(err, req, res, next) {
    // console.error(err.stack);
    const status = err.status || 500;
    const message = errorMessages[status] || 'An unexpected error occurred';
    res.status(status).json({
        message: message,
        error: err.message,
    });
}

module.exports = errorHandler;