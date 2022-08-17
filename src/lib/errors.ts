export class AuthError extends Error {
  protected __isAuthError = true

  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return typeof error === 'object' && error !== null && '__isAuthError' in error
}

export class AuthApiError extends AuthError {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
    }
  }
}

export class AuthUnknownError extends AuthError {
  originalError: unknown

  constructor(message: string, originalError: unknown) {
    super(message)
    this.name = 'AuthUnknownError'
    this.originalError = originalError
  }
}

export class CustomAuthError extends AuthError {
  name: string
  status: number
  constructor(message: string, name: string, status: number) {
    super(message)
    this.name = name
    this.status = status
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
    }
  }
}

export class AuthSessionMissingError extends CustomAuthError {
  constructor() {
    super('Auth session missing!', 'AuthSessionMissingError', 400)
  }
}

export class AuthInvalidCredentialsError extends CustomAuthError {
  constructor(message: string) {
    super(message, 'AuthInvalidCredentialsError', 400)
  }
}

export class AuthMalformedCallbackUrlError extends CustomAuthError {
  constructor(message: string) {
    super(message, 'AuthCallbackUrlError', 500)
  }
}

export class AuthRetryableFetchError extends CustomAuthError {
  constructor(message: string, status: number) {
    super(message, 'AuthRetryableFetchError', status)
  }
}