// domain/core/application/errors/ApplicationError.ts

export abstract class ApplicationError extends Error {
  abstract readonly statusCode: number;
  readonly code: string;

  protected constructor(
    message: string,
    code: string
  ) {
    super(message);
    this.code = code;

    // Required when extending Error in TS
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
