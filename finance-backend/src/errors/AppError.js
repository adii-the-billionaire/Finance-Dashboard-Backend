export class AppError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {Record<string, unknown>} [details]
   */
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function assert(condition, statusCode, message) {
  if (!condition) throw new AppError(statusCode, message);
}
