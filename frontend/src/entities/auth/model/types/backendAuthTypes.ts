/**
 * Контракты публичного API AuthService (OpenAPI HockeyNights).
 */

export interface ApiAccount {
  id: string
  email: string
  emailVerified: boolean
  createdAt: string
}

export interface ApiTokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: string
}

export interface ApiCodeSent {
  expiresIn: string
  maskedEmail: string
  resendAfter: string
}

/** protobuf enum CodePurpose */
export const CodePurpose = {
  UNSPECIFIED: 0,
  EMAIL_VERIFICATION: 1,
  LOGIN: 2,
  PASSWORD_RESET: 3,
} as const

export type CodePurposeValue = (typeof CodePurpose)[keyof typeof CodePurpose]

export interface ApiLoginRequest {
  email: string
  password: string
  deviceName?: string
  deviceToken?: string
}

export interface ApiLoginResponse {
  account?: ApiAccount
  tokens?: ApiTokenPair
  codeRequired?: boolean
  code?: ApiCodeSent
}

export interface ApiRegisterRequest {
  email: string
  password: string
}

export interface ApiRegisterResponse {
  code: ApiCodeSent
}

export interface ApiVerifyEmailRequest {
  email: string
  code: string
  deviceName?: string
}

export interface ApiVerifyEmailResponse {
  account: ApiAccount
  tokens: ApiTokenPair
  deviceToken: string
}

export interface ApiVerifyLoginCodeRequest {
  email: string
  code: string
  deviceName?: string
}

export interface ApiVerifyLoginCodeResponse {
  account: ApiAccount
  tokens: ApiTokenPair
  deviceToken: string
}

export interface ApiRefreshRequest {
  refreshToken: string
}

export interface ApiRefreshResponse {
  tokens: ApiTokenPair
}

export interface ApiGetMeResponse {
  account: ApiAccount
}

export interface ApiRequestPasswordResetRequest {
  email: string
}

export interface ApiRequestPasswordResetResponse {
  code: ApiCodeSent
}

export interface ApiResetPasswordRequest {
  email: string
  code: string
  newPassword: string
}

export interface ApiResendCodeRequest {
  email: string
  purpose: CodePurposeValue
}
