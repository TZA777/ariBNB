// =======================
// CUSTOM ERROR CLASS
// =======================

// Create a custom error class by extending the built-in Error class
// This allows you to attach extra information (like HTTP status codes)
class ExpressError extends Error {

  // Constructor runs when new ExpressError(...) is created
  constructor(status, message) {

    // Call parent Error constructor
    // Initializes base error properties (like stack trace)
    super();

    // Store HTTP status code (e.g., 404, 400, 500)
    this.status = status;

    // Store custom error message
    this.message = message;
  }
}


// =======================
// EXPORT CLASS
// =======================

// Export so it can be used in other files
// Example:
// throw new ExpressError(404, "Page not found");
module.exports = ExpressError;