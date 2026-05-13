export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export const BadRequest    = (msg: string, details?: unknown) => new AppError(400, 'BAD_REQUEST', msg, details);
export const Unauthorized  = (msg = 'Não autenticado')         => new AppError(401, 'UNAUTHORIZED', msg);
export const Forbidden     = (msg = 'Acesso negado')           => new AppError(403, 'FORBIDDEN', msg);
export const NotFound      = (msg = 'Não encontrado')          => new AppError(404, 'NOT_FOUND', msg);
export const Conflict      = (msg: string)                     => new AppError(409, 'CONFLICT', msg);
export const TooMany       = (msg = 'Muitas tentativas')       => new AppError(429, 'TOO_MANY_REQUESTS', msg);
