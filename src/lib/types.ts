import { AuthError } from './errors'
import { Fetch } from './fetch'

/** One of the providers supported by GoTrue. */
export type Provider =
  | 'apple'
  | 'azure'
  | 'bitbucket'
  | 'discord'
  | 'facebook'
  | 'github'
  | 'gitlab'
  | 'google'
  | 'keycloak'
  | 'linkedin'
  | 'notion'
  | 'slack'
  | 'spotify'
  | 'twitch'
  | 'twitter'
  | 'workos'

export type AuthChangeEventMFA = 'MFA_CHALLENGE_VERIFIED'

export type AuthChangeEvent =
  | 'PASSWORD_RECOVERY'
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | AuthChangeEventMFA

export type GoTrueClientOptions = {
  /* The URL of the GoTrue server. */
  url?: string
  /* Any additional headers to send to the GoTrue server. */
  headers?: { [key: string]: string }
  /* Optional key name used for storing tokens in local storage. */
  storageKey?: string
  /* Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user. */
  detectSessionInUrl?: boolean
  /* Set to "true" if you want to automatically refresh the token before expiring. */
  autoRefreshToken?: boolean
  /* Set to "true" if you want to automatically save the user session into local storage. If set to false, session will just be saved in memory. */
  persistSession?: boolean
  /* Provide your own local storage implementation to use instead of the browser's local storage. */
  storage?: SupportedStorage
  /* A custom fetch implementation. */
  fetch?: Fetch
}

export type AuthResponse =
  | {
      data: {
        user: User | null
        session: Session | null
      }
      error: null
    }
  | {
      data: {
        user: null
        session: null
      }
      error: AuthError
    }

export type OAuthResponse =
  | {
      data: {
        provider: Provider
        url: string
      }
      error: null
    }
  | {
      data: {
        provider: Provider
        url: null
      }
      error: AuthError
    }

export type SSOResponse =
  | {
      data: {
        /** URL to take the user to (in a browser) to complete SSO. */
        url: string
      }
      error: null
    }
  | {
      data: null
      error: AuthError
    }

export type UserResponse =
  | {
      data: {
        user: User
      }
      error: null
    }
  | {
      data: {
        user: null
      }
      error: AuthError
    }

export interface Session {
  /**
   * The oauth provider token. If present, this can be used to make external API requests to the oauth provider used.
   */
  provider_token?: string | null
  /**
   * The oauth provider refresh token. If present, this can be used to refresh the provider_token via the oauth provider's API.
   * Not all oauth providers return a provider refresh token. If the provider_refresh_token is missing, please refer to the oauth provider's documentation for information on how to obtain the provider refresh token.
   */
  provider_refresh_token?: string | null
  /**
   * The access token jwt. It is recommended to set the JWT_EXPIRY to a shorter expiry value.
   */
  access_token: string
  /**
   * A one-time used refresh token that never expires.
   */
  refresh_token: string
  /**
   * The number of seconds until the token expires (since it was issued). Returned when a login is confirmed.
   */
  expires_in: number
  /**
   * A timestamp of when the token will expire. Returned when a login is confirmed.
   */
  expires_at?: number
  token_type: string
  user: User
}

/**
 * An authentication methord reference (AMR) entry.
 *
 * An entry designates what method was used by the user to verify their
 * identity and at what time.
 *
 * @see {@link GoTrueMFAApi#getAuthenticatorAssuranceLevel}.
 */
export interface AMREntry {
  /** Authentication method name. */
  method: 'password' | 'otp' | 'oauth' | 'mfa/totp' | string

  /**
   * Timestamp when the method was successfully used. Represents number of
   * seconds since 1st January 1970 (UNIX epoch) in UTC.
   */
  timestamp: number
}

export interface UserIdentity {
  id: string
  user_id: string
  identity_data: {
    [key: string]: any
  }
  provider: string
  created_at: string
  last_sign_in_at: string
  updated_at?: string
}

/**
 * A MFA factor.
 *
 * @see {@link GoTrueMFAApi#enroll}
 * @see {@link GoTrueMFAApi#listFactors}
 * @see {@link GoTrueMFAAdminApi#listFactors}
 */
export interface Factor {
  /** ID of the factor. */
  id: string

  /** Friendly name of the factor, useful to disambiguate between multiple factors. */
  friendly_name?: string

  /**
   * Type of factor. Only `totp` supported with this version but may change in
   * future versions.
   */
  factor_type: 'totp' | string

  /** Factor's status. */
  status: 'verified' | 'unverified'

  created_at: string
  updated_at: string
}

export interface UserAppMetadata {
  provider?: string
  [key: string]: any
}

export interface UserMetadata {
  [key: string]: any
}

export interface User {
  id: string
  app_metadata: UserAppMetadata
  user_metadata: UserMetadata
  aud: string
  confirmation_sent_at?: string
  recovery_sent_at?: string
  email_change_sent_at?: string
  new_email?: string
  invited_at?: string
  action_link?: string
  email?: string
  phone?: string
  created_at: string
  confirmed_at?: string
  email_confirmed_at?: string
  phone_confirmed_at?: string
  last_sign_in_at?: string
  role?: string
  updated_at?: string
  identities?: UserIdentity[]
  factors?: Factor[]
}

export interface UserAttributes {
  /**
   * The user's email.
   */
  email?: string

  /**
   * The user's phone.
   */
  phone?: string

  /**
   * The user's password.
   */
  password?: string

  /**
   * A custom data object to store the user's metadata. This maps to the `auth.users.user_metadata` column.
   *
   * The `data` should be a JSON object that includes user-specific info, such as their first and last name.
   *
   */
  data?: object
}

export interface AdminUserAttributes extends UserAttributes {
  /**
   * A custom data object to store the user's metadata. This maps to the `auth.users.user_metadata` column.
   *
   * Only a service role can modify.
   *
   * The `user_metadata` should be a JSON object that includes user-specific info, such as their first and last name.
   *
   * Note: When using the GoTrueAdminApi and wanting to modify a user's metadata,
   * this attribute is used instead of UserAttributes data.
   *
   */
  user_metadata?: object

  /**
   * A custom data object to store the user's application specific metadata. This maps to the `auth.users.app_metadata` column.
   *
   * Only a service role can modify.
   *
   * The `app_metadata` should be a JSON object that includes app-specific info, such as identity providers, roles, and other
   * access control information.
   */
  app_metadata?: object

  /**
   * Confirms the user's email address if set to true.
   *
   * Only a service role can modify.
   */
  email_confirm?: boolean

  /**
   * Confirms the user's phone number if set to true.
   *
   * Only a service role can modify.
   */
  phone_confirm?: boolean

  /**
   * Determines how long a user is banned for.
   *
   * The format for the ban duration follows a strict sequence of decimal numbers with a unit suffix.
   * Valid time units are "ns", "us" (or "µs"), "ms", "s", "m", "h".
   *
   * For example, some possible durations include: '300ms', '2h45m'.
   *
   * Setting the ban duration to 'none' lifts the ban on the user.
   */
  ban_duration?: string | 'none'
}

export interface Subscription {
  /**
   * The subscriber UUID. This will be set by the client.
   */
  id: string
  /**
   * The function to call every time there is an event. eg: (eventName) => {}
   */
  callback: (event: AuthChangeEvent, session: Session | null) => void
  /**
   * Call this to remove the listener.
   */
  unsubscribe: () => void
}

export interface UpdatableFactorAttributes {
  friendlyName: string
}

export type SignUpWithPasswordCredentials =
  | {
      /** The user's email address. */
      email: string
      /** The user's password. */
      password: string
      options?: {
        /** The redirect url embedded in the email link */
        emailRedirectTo?: string
        /**
         * A custom data object to store the user's metadata. This maps to the `auth.users.user_metadata` column.
         *
         * The `data` should be a JSON object that includes user-specific info, such as their first and last name.
         */
        data?: object
        /** Verification token received when the user completes the captcha on the site. */
        captchaToken?: string
      }
    }
  | {
      /** The user's phone number. */
      phone: string
      /** The user's password. */
      password: string
      options?: {
        /**
         * A custom data object to store the user's metadata. This maps to the `auth.users.user_metadata` column.
         *
         * The `data` should be a JSON object that includes user-specific info, such as their first and last name.
         */
        data?: object
        /** Verification token received when the user completes the captcha on the site. */
        captchaToken?: string
      }
    }
export type SignInWithPasswordCredentials =
  | {
      /** The user's email address. */
      email: string
      /** The user's password. */
      password: string
      options?: {
        /**
         * A custom data object to store the user's metadata. This maps to the `auth.users.user_metadata` column.
         *
         * The `data` should be a JSON object that includes user-specific info, such as their first and last name.
         */
        data?: object
        /** Verification token received when the user completes the captcha on the site. */
        captchaToken?: string
      }
    }
  | {
      /** The user's phone number. */
      phone: string
      /** The user's password. */
      password: string
      options?: {
        /**
         * A custom data object to store the user's metadata. This maps to the `auth.users.user_metadata` column.
         *
         * The `data` should be a JSON object that includes user-specific info, such as their first and last name.
         */
        data?: object
        /** Verification token received when the user completes the captcha on the site. */
        captchaToken?: string
      }
    }

export type SignInWithPasswordlessCredentials =
  | {
      /** The user's email address. */
      email: string
      options?: {
        /** The redirect url embedded in the email link */
        emailRedirectTo?: string
        /** If set to false, this method will not create a new user. Defaults to true. */
        shouldCreateUser?: boolean
        /**
         * A custom data object to store the user's metadata. This maps to the `auth.users.user_metadata` column.
         *
         * The `data` should be a JSON object that includes user-specific info, such as their first and last name.
         */
        data?: object
        /** Verification token received when the user completes the captcha on the site. */
        captchaToken?: string
      }
    }
  | {
      /** The user's phone number. */
      phone: string
      options?: {
        /** If set to false, this method will not create a new user. Defaults to true. */
        shouldCreateUser?: boolean
        /**
         * A custom data object to store the user's metadata. This maps to the `auth.users.user_metadata` column.
         *
         * The `data` should be a JSON object that includes user-specific info, such as their first and last name.
         */
        data?: object
        /** Verification token received when the user completes the captcha on the site. */
        captchaToken?: string
      }
    }

export type SignInWithOAuthCredentials = {
  /** One of the providers supported by GoTrue. */
  provider: Provider
  options?: {
    /** A URL to send the user to after they are confirmed. */
    redirectTo?: string
    /** A space-separated list of scopes granted to the OAuth application. */
    scopes?: string
    /** An object of query params */
    queryParams?: { [key: string]: string }
  }
}

export type VerifyOtpParams = VerifyMobileOtpParams | VerifyEmailOtpParams
export interface VerifyMobileOtpParams {
  /** The user's phone number. */
  phone: string
  /** The otp sent to the user's phone number. */
  token: string
  /** The user's verification type. */
  type: MobileOtpType
  options?: {
    /** A URL to send the user to after they are confirmed. */
    redirectTo?: string

    /**
     * Verification token received when the user completes the captcha on the site.
     *
     * @deprecated
     */
    captchaToken?: string
  }
}
export interface VerifyEmailOtpParams {
  /** The user's email address. */
  email: string
  /** The otp sent to the user's email address. */
  token: string
  /** The user's verification type. */
  type: EmailOtpType
  options?: {
    /** A URL to send the user to after they are confirmed. */
    redirectTo?: string
    /** Verification token received when the user completes the captcha on the site. */
    captchaToken?: string
  }
}

export type MobileOtpType = 'sms' | 'phone_change'
export type EmailOtpType = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change'

export type SignInWithSSO = {
  options?: {
    /** A URL to send the user to after they have signed-in. */
    redirectTo?: string
    /** Verification token received when the user completes the captcha on the site. */
    captchaToken?: string
  }
} & (
  | {
      /** UUID of the SSO provider to invoke single-sign on to. */
      providerId: string
    }
  | {
      /** Domain name of the organization for which to invoke single-sign on. */
      domain: string
    }
)

export type GenerateSignupLinkParams = {
  type: 'signup'
  email: string
  password: string
  options?: Pick<GenerateLinkOptions, 'data' | 'redirectTo'>
}

export type GenerateInviteOrMagiclinkParams = {
  type: 'invite' | 'magiclink'
  /** The user's email */
  email: string
  options?: Pick<GenerateLinkOptions, 'data' | 'redirectTo'>
}

export type GenerateRecoveryLinkParams = {
  type: 'recovery'
  /** The user's email */
  email: string
  options?: Pick<GenerateLinkOptions, 'redirectTo'>
}

export type GenerateEmailChangeLinkParams = {
  type: 'email_change_current' | 'email_change_new'
  /** The user's email */
  email: string
  /**
   * The user's new email. Only required if type is 'email_change_current' or 'email_change_new'.
   */
  newEmail: string
  options?: Pick<GenerateLinkOptions, 'redirectTo'>
}

export interface GenerateLinkOptions {
  /**
   * A custom data object to store the user's metadata. This maps to the `auth.users.user_metadata` column.
   *
   * The `data` should be a JSON object that includes user-specific info, such as their first and last name.
   */
  data?: object
  /** The URL which will be appended to the email link generated. */
  redirectTo?: string
}

export type GenerateLinkParams =
  | GenerateSignupLinkParams
  | GenerateInviteOrMagiclinkParams
  | GenerateRecoveryLinkParams
  | GenerateEmailChangeLinkParams

export type GenerateLinkResponse =
  | {
      data: {
        properties: GenerateLinkProperties
        user: User
      }
      error: null
    }
  | {
      data: {
        properties: null
        user: null
      }
      error: AuthError
    }

/** The properties related to the email link generated  */
export type GenerateLinkProperties = {
  /**
   * The email link to send to the user.
   * The action_link follows the following format: auth/v1/verify?type={verification_type}&token={hashed_token}&redirect_to={redirect_to}
   * */
  action_link: string
  /**
   * The raw email OTP.
   * You should send this in the email if you want your users to verify using an OTP instead of the action link.
   * */
  email_otp: string
  /**
   * The hashed token appended to the action link.
   * */
  hashed_token: string
  /** The URL appended to the action link. */
  redirect_to: string
  /** The verification type that the email link is associated to. */
  verification_type: GenerateLinkType
}

export type GenerateLinkType =
  | 'signup'
  | 'invite'
  | 'magiclink'
  | 'recovery'
  | 'email_change_current'
  | 'email_change_new'

export type MFAEnrollParams = {
  /** The type of factor being enrolled. */
  factorType: 'totp'
  /** Domain which the user is enrolled with. */
  issuer?: string
  /** Human readable name assigned to the factor. */
  friendlyName?: string
}

export type MFAUnenrollParams = {
  /** ID of the factor being unenrolled. */
  factorId: string
}

export type MFAVerifyParams = {
  /** ID of the factor being verified. Returned in enroll(). */
  factorId: string

  /** ID of the challenge being verified. Returned in challenge(). */
  challengeId: string

  /** Verification code provided by the user. */
  code: string
}

export type MFAChallengeParams = {
  /** ID of the factor to be challenged. Returned in enroll(). */
  factorId: string
}

export type MFAChallengeAndVerifyParams = {
  /** ID of the factor being verified. Returned in enroll(). */
  factorId: string
  /** Verification code provided by the user. */
  code: string
}

export type AuthMFAVerifyResponse =
  | {
      data: {
        /** New access token (JWT) after successful verification. */
        access_token: string

        /** Type of token, typically `Bearer`. */
        token_type: string

        /** Number of seconds in which the access token will expire. */
        expires_in: number

        /** Refresh token you can use to obtain new access tokens when expired. */
        refresh_token: string

        /** Updated user profile. */
        user: User
      }
      error: null
    }
  | {
      data: null
      error: AuthError
    }

export type AuthMFAEnrollResponse =
  | {
      data: {
        /** ID of the factor that was just enrolled (in an unverified state). */
        id: string

        /** Type of MFA factor. Only `totp` supported for now. */
        type: 'totp'

        /** TOTP enrollment information. */
        totp: {
          /** Contains a QR code encoding the authenticator URI. You can
           * convert it to a URL by prepending `data:image/svg+xml;utf-8,` to
           * the value. Avoid logging this value to the console. */
          qr_code: string

          /** The TOTP secret (also encoded in the QR code). Show this secret
           * in a password-style field to the user, in case they are unable to
           * scan the QR code. Avoid logging this value to the console. */
          secret: string

          /** The authenticator URI encoded within the QR code, should you need
           * to use it. Avoid loggin this value to the console. */
          uri: string
        }
      }
      error: null
    }
  | {
      data: null
      error: AuthError
    }

export type AuthMFAUnenrollResponse =
  | {
      data: {
        /** ID of the factor that was successfully unenrolled. */
        id: string
      }
      error: null
    }
  | { data: null; error: AuthError }

export type AuthMFAChallengeResponse =
  | {
      data: {
        /** ID of the newly created challenge. */
        id: string

        /** Timestamp in UNIX seconds when this challenge will no longer be usable. */
        expires_at: number
      }
      error: null
    }
  | { data: null; error: AuthError }

export type AuthMFAListFactorsResponse =
  | {
      data: {
        /** All available factors (verified and unverified). */
        all: Factor[]

        /** Only verified TOTP factors. (A subset of `all`.) */
        totp: Factor[]
      }
      error: null
    }
  | { data: null; error: AuthError }

export type AuthenticatorAssuranceLevels = 'aal1' | 'aal2'

export type AuthMFAGetAuthenticatorAssuranceLevelResponse =
  | {
      data: {
        /** Current AAL level of the session. */
        currentLevel: AuthenticatorAssuranceLevels | null

        /**
         * Next possible AAL level for the session. If the next level is higher
         * than the current one, the user should go through MFA.
         *
         * @see {@link GoTrueMFAApi#challenge}
         */
        nextLevel: AuthenticatorAssuranceLevels | null

        /**
         * A list of all authentication methods attached to this session. Use
         * the information here to detect the last time a user verified a
         * factor, for example if implementing a step-up scenario.
         */
        currentAuthenticationMethods: AMREntry[]
      }
      error: null
    }
  | { data: null; error: AuthError }

/**
 * Contains the full multi-factor authentication API.
 *
 */
export interface GoTrueMFAApi {
  /**
   * Starts the enrollment process for a new Multi-Factor Authentication (MFA)
   * factor. This method creates a new `unverified` factor.
   * To verify a factor, present the QR code or secret to the user and ask them to add it to their
   * authenticator app.
   * The user has to enter the code from their authenticator app to verify it.
   *
   * Upon verifying a factor, all other sessions are logged out and the current session's authenticator level is promoted to `aal2`.
   *
   */
  enroll(params: MFAEnrollParams): Promise<AuthMFAEnrollResponse>

  /**
   * Prepares a challenge used to verify that a user has access to a MFA
   * factor.
   */
  challenge(params: MFAChallengeParams): Promise<AuthMFAChallengeResponse>

  /**
   * Verifies a code against a challenge. The verification code is
   * provided by the user by entering a code seen in their authenticator app.
   */
  verify(params: MFAVerifyParams): Promise<AuthMFAVerifyResponse>

  /**
   * Unenroll removes a MFA factor.
   * A user has to have an `aal2` authenticator level in order to unenroll a `verified` factor.
   */
  unenroll(params: MFAUnenrollParams): Promise<AuthMFAUnenrollResponse>

  /**
   * Helper method which creates a challenge and immediately uses the given code to verify against it thereafter. The verification code is
   * provided by the user by entering a code seen in their authenticator app.
   */
  challengeAndVerify(params: MFAChallengeAndVerifyParams): Promise<AuthMFAVerifyResponse>

  /**
   * Returns the list of MFA factors enabled for this user. For most use cases
   * you should consider using {@link
   * GoTrueMFAApi#getAuthenticatorAssuranceLevel}. This uses a cached version
   * of the factors and avoids incurring a network call. If you need to update
   * this list, call {@link GoTrueClient#getUser} first.
   *
   * @see {@link GoTrueMFAApi#enroll}
   * @see {@link GoTrueMFAApi#getAuthenticatorAssuranceLevel}
   * @see {@link GoTrueClient#getUser}
   *
   */
  listFactors(): Promise<AuthMFAListFactorsResponse>

  /**
   * Returns the Authenticator Assurance Level (AAL) for the active session.
   *
   * - `aal1` (or `null`) means that the user's identity has been verified only
   * with a conventional login (email+password, OTP, magic link, social login,
   * etc.).
   * - `aal2` means that the user's identity has been verified both with a conventional login and at least one MFA factor.
   *
   * Although this method returns a promise, it's fairly quick (microseconds)
   * and rarely uses the network. You can use this to check whether the current
   * user needs to be shown a screen to verify their MFA factors.
   *
   */
  getAuthenticatorAssuranceLevel(): Promise<AuthMFAGetAuthenticatorAssuranceLevelResponse>
}

/**
 * @expermental
 */
export type AuthMFAAdminDeleteFactorResponse =
  | {
      data: {
        /** ID of the factor that was successfully deleted. */
        id: string
      }
      error: null
    }
  | { data: null; error: AuthError }

/**
 * @expermental
 */
export type AuthMFAAdminDeleteFactorParams = {
  /** ID of the MFA factor to delete. */
  id: string

  /** ID of the user whose factor is being deleted. */
  userId: string
}

/**
 * @expermental
 */
export type AuthMFAAdminListFactorsResponse =
  | {
      data: {
        /** All factors attached to the user. */
        factors: Factor[]
      }
      error: null
    }
  | { data: null; error: AuthError }

/**
 * @expermental
 */
export type AuthMFAAdminListFactorsParams = {
  /** ID of the user. */
  userId: string
}

/**
 * Contains the full multi-factor authentication administration API.
 *
 * @expermental
 */
export interface GoTrueAdminMFAApi {
  /**
   * Lists all factors associated to a user.
   *
   */
  listFactors(params: AuthMFAAdminListFactorsParams): Promise<AuthMFAAdminListFactorsResponse>

  /**
   * Deletes a factor on a user. This will log the user out of all active
   * sessions if the deleted factor was verified.
   *
   * @see {@link GoTrueMFAApi#unenroll}
   *
   * @expermental
   */
  deleteFactor(params: AuthMFAAdminDeleteFactorParams): Promise<AuthMFAAdminDeleteFactorResponse>
}

type AnyFunction = (...args: any[]) => any
type MaybePromisify<T> = T | Promise<T>

type PromisifyMethods<T> = {
  [K in keyof T]: T[K] extends AnyFunction
    ? (...args: Parameters<T[K]>) => MaybePromisify<ReturnType<T[K]>>
    : T[K]
}

export type SupportedStorage = PromisifyMethods<Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>>

export type InitializeResult = { error: AuthError | null }

export type CallRefreshTokenResult =
  | {
      session: Session
      error: null
    }
  | {
      session: null
      error: AuthError
    }
