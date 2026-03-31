const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // PostgreSQL specific errors
    if (err.code === '23505') {
        return res.status(409).json({
            error: 'Duplicate entry',
            message: 'A todo with this information already exists'
        });
    }

    if (err.code === '23502') {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Required field is missing'
        });
    }

    // Default error
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong'
    });
};

module.exports = errorHandler;