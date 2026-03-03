import { Request, Response, NextFunction } from "express";

/**
 * Global Express error handler — catches anything thrown from routes
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  console.error("[GlobalErrorHandler]", err.message);
  res.status(500).json({
    error: "UNHANDLED_ERROR",
    message: "An unexpected error occurred.",
  });
}

/**
 * 404 handler for unknown routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: "NOT_FOUND",
    message: `Route ${req.method} ${req.path} does not exist.`,
  });
}