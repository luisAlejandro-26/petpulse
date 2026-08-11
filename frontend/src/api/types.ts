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

export interface RegisterPayload {
  name_user: string
  email: string
  password: string
  gender: string
  birth_date: string
}
