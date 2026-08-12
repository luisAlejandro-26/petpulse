export interface User {
  id_user: number
  name_user: string
  email: string
  role_account: string
  gender?: string
  birth_date?: string
  profile_image_url?: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface MeResponse {
  user: User
}

export interface LoginDTO {
  email: string
  password: string
}

export interface RegisterDTO {
  name_user: string
  email: string
  password: string
  gender: string
  birth_date: string
}

export interface ForgotPasswordDTO {
  email: string
}

export interface VerifyCodeDTO {
  email: string
  code: string
}

export interface ResetPasswordDTO {
  email: string
  code: string
  new_password: string
}
