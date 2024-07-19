class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [], //keep error codes
    stack = "", //error stack
  ) {
    //to overwrite
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.message = message;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
module.exports=ApiError;