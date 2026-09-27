export const errorHandler = (err, req, res, next) => {
  const requestId = req?.requestId || `req_${Date.now()}`;
  console.error(`[API Error] [${requestId}]`, err);

  // Default error status and message
  const statusCode = err.status || err.statusCode || 500;
  const message = err.isPublic ? err.message : (statusCode === 500 ? 'Internal Server Error' : err.message);
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    message: message || 'An unexpected error occurred.',
    code,
    requestId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
