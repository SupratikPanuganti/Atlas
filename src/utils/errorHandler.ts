// Error Handling Utilities
// Centralized error handling and logging

import React from 'react'
import { logger } from './index'
import { ERROR_MESSAGES } from '../constants'

export interface AppError extends Error {
  code?: string
  statusCode?: number
  context?: Record<string, any>
  isOperational?: boolean
}

export class CustomError extends Error implements AppError {
  public readonly code?: string
  public readonly statusCode?: number
  public readonly context?: Record<string, any>
  public readonly isOperational: boolean

  constructor(
    message: string,
    code?: string,
    statusCode?: number,
    context?: Record<string, any>,
    isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.context = context
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

// Specific Error Types
export class NetworkError extends CustomError {
  constructor(message: string = ERROR_MESSAGES.NETWORK, context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', 0, context)
  }
}

export class AuthError extends CustomError {
  constructor(message: string = ERROR_MESSAGES.AUTH, context?: Record<string, any>) {
    super(message, 'AUTH_ERROR', 401, context)
  }
}

export class ValidationError extends CustomError {
  constructor(message: string = ERROR_MESSAGES.VALIDATION, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, context)
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = ERROR_MESSAGES.NOT_FOUND, context?: Record<string, any>) {
    super(message, 'NOT_FOUND_ERROR', 404, context)
  }
}

export class ServerError extends CustomError {
  constructor(message: string = ERROR_MESSAGES.SERVER, context?: Record<string, any>) {
    super(message, 'SERVER_ERROR', 500, context)
  }
}

export class TimeoutError extends CustomError {
  constructor(message: string = ERROR_MESSAGES.TIMEOUT, context?: Record<string, any>) {
    super(message, 'TIMEOUT_ERROR', 408, context)
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED, context?: Record<string, any>) {
    super(message, 'UNAUTHORIZED_ERROR', 401, context)
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = ERROR_MESSAGES.FORBIDDEN, context?: Record<string, any>) {
    super(message, 'FORBIDDEN_ERROR', 403, context)
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = ERROR_MESSAGES.RATE_LIMIT, context?: Record<string, any>) {
    super(message, 'RATE_LIMIT_ERROR', 429, context)
  }
}

// Error Handler Class
export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: AppError[] = []

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // Handle and log errors
  handleError(error: Error | AppError, context?: Record<string, any>): AppError {
    let appError: AppError

    if (error instanceof CustomError) {
      appError = error
    } else {
      // Convert regular errors to AppError
      appError = new CustomError(
        error.message,
        'UNKNOWN_ERROR',
        500,
        { ...context, originalError: error.name }
      )
    }

    // Add context if provided
    if (context) {
      appError.context = { ...appError.context, ...context }
    }

    // Log error
    this.logError(appError)

    // Store in error log
    this.errorLog.push(appError)

    return appError
  }

  // Log error with appropriate level
  private logError(error: AppError): void {
    const logData = {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
      stack: error.stack
    }

    if (error.statusCode && error.statusCode >= 500) {
      logger.error(`Server Error: ${error.message}`, logData)
    } else if (error.statusCode && error.statusCode >= 400) {
      logger.warn(`Client Error: ${error.message}`, logData)
    } else {
      logger.info(`Error: ${error.message}`, logData)
    }
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error: AppError): string {
    // Return user-friendly message based on error code
    switch (error.code) {
      case 'NETWORK_ERROR':
        return ERROR_MESSAGES.NETWORK
      case 'AUTH_ERROR':
        return ERROR_MESSAGES.AUTH
      case 'VALIDATION_ERROR':
        return ERROR_MESSAGES.VALIDATION
      case 'NOT_FOUND_ERROR':
        return ERROR_MESSAGES.NOT_FOUND
      case 'SERVER_ERROR':
        return ERROR_MESSAGES.SERVER
      case 'TIMEOUT_ERROR':
        return ERROR_MESSAGES.TIMEOUT
      case 'UNAUTHORIZED_ERROR':
        return ERROR_MESSAGES.UNAUTHORIZED
      case 'FORBIDDEN_ERROR':
        return ERROR_MESSAGES.FORBIDDEN
      case 'RATE_LIMIT_ERROR':
        return ERROR_MESSAGES.RATE_LIMIT
      default:
        return error.message || ERROR_MESSAGES.SERVER
    }
  }

  // Get error log
  getErrorLog(): AppError[] {
    return [...this.errorLog]
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = []
  }

  // Get error statistics
  getErrorStats(): {
    total: number
    byCode: Record<string, number>
    byStatusCode: Record<number, number>
  } {
    const stats = {
      total: this.errorLog.length,
      byCode: {} as Record<string, number>,
      byStatusCode: {} as Record<number, number>
    }

    this.errorLog.forEach(error => {
      // Count by code
      if (error.code) {
        stats.byCode[error.code] = (stats.byCode[error.code] || 0) + 1
      }

      // Count by status code
      if (error.statusCode) {
        stats.byStatusCode[error.statusCode] = (stats.byStatusCode[error.statusCode] || 0) + 1
      }
    })

    return stats
  }
}

// Global error handler instance
export const errorHandler = ErrorHandler.getInstance()

// Utility functions for common error scenarios
export const handleApiError = (error: any, context?: Record<string, any>): AppError => {
  if (error.response) {
    // API responded with error status
    const statusCode = error.response.status
    const message = error.response.data?.message || error.message

    switch (statusCode) {
      case 400:
        return errorHandler.handleError(new ValidationError(message, context))
      case 401:
        return errorHandler.handleError(new UnauthorizedError(message, context))
      case 403:
        return errorHandler.handleError(new ForbiddenError(message, context))
      case 404:
        return errorHandler.handleError(new NotFoundError(message, context))
      case 408:
        return errorHandler.handleError(new TimeoutError(message, context))
      case 429:
        return errorHandler.handleError(new RateLimitError(message, context))
      case 500:
      case 502:
      case 503:
      case 504:
        return errorHandler.handleError(new ServerError(message, context))
      default:
        return errorHandler.handleError(new ServerError(message, context))
    }
  } else if (error.request) {
    // Network error
    return errorHandler.handleError(new NetworkError(undefined, context))
  } else {
    // Other error
    return errorHandler.handleError(new ServerError(error.message, context))
  }
}

export const handleDatabaseError = (error: any, context?: Record<string, any>): AppError => {
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique constraint violation
        return errorHandler.handleError(new ValidationError('This record already exists', context))
      case '23503': // Foreign key constraint violation
        return errorHandler.handleError(new ValidationError('Referenced record not found', context))
      case '23502': // Not null constraint violation
        return errorHandler.handleError(new ValidationError('Required field is missing', context))
      default:
        return errorHandler.handleError(new ServerError('Database error occurred', context))
    }
  }
  
  return errorHandler.handleError(new ServerError('Database error occurred', context))
}

// Async error wrapper
export const asyncHandler = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      throw errorHandler.handleError(error as Error, { function: fn.name, args })
    }
  }
}

// Error boundary for React components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: AppError }>
) => {
  return class ErrorBoundary extends React.Component<P, { hasError: boolean; error?: AppError }> {
    constructor(props: P) {
      super(props)
      this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): { hasError: boolean; error: AppError } {
      const appError = errorHandler.handleError(error, { component: Component.name })
      return { hasError: true, error: appError }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      errorHandler.handleError(error, {
        component: Component.name,
        errorInfo
      })
    }

    render() {
      if (this.state.hasError) {
        if (fallback && this.state.error) {
          return React.createElement(fallback, { error: this.state.error })
        }
        return null
      }

      return React.createElement(Component, this.props)
    }
  }
}
