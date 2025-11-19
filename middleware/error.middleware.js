export default function errorHandler(err, req, res, next) {
  console.log(err.stack)

  const statusCode = err.statusCode || err.status || 500
  const message = err.message || 'Internal Server Error'

  // set up error response
  const errorResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: {
        name: err.name,
        code: err.code,
        status: err.status,
        statusCode: err.statusCode,
        details: err.details,
      },
    }),
  }

  res.status(statusCode).json(errorResponse)
}
