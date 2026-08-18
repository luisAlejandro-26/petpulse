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
export type PetSpecies = 'PERRO' | 'GATO' | 'CONEJO' | 'PAJARO' | 'OTHER'
export type EventType = 'VACUNA' | 'CONTROL' | 'DESPARACITACION' | 'CIRUGIA' | 'OTHER'
export type EventStatus = 'COMPLETED' | 'SCHEDULED' | 'CANCELLED'
export interface Pet {
  id_pet: number
  id_user: number
  name_pet: string
  species: PetSpecies
  breed: string | null
  birth_date: string
  diseases: string | null
  notes: string | null
  pet_image_url: string | null
  gender: string | null
  weight: number | null
  color: string | null
  created_at: string
}
export interface PetsResponse {
  pets: Pet[]
}
export interface PetResponse {
  pet: Pet
}
export interface CreatePetDTO {
  name_pet: string
  species: PetSpecies
  breed?: string
  birth_date: string
  diseases?: string
  notes?: string
  pet_image_url?: string
  gender?: string
  weight?: number
  color?: string
}
export interface UpdatePetDTO {
  name_pet?: string
  species?: PetSpecies
  breed?: string
  birth_date?: string
  diseases?: string
  notes?: string
  pet_image_url?: string
  gender?: string
  weight?: number
  color?: string
}
// ── Dashboard (Home) ──
export interface UsersResponse {
  users: User[]
}
export interface AdminStats {
  total_users: number
  total_consultations: number
  storage_used_gb: number
}
export interface Appointment {
  id_appointment: number
  title: string
  date: string
  pet_name?: string
}
export interface Reminder {
  id_reminder: number
  title: string
  due_date: string
  done: boolean
}
export type ActivityType = 'VACUNA' | 'CONSULTA' | 'MEDICAMENTO' | 'RECORDATORIO'
export interface Activity {
  id: number
  type: ActivityType
  title: string
  description: string
  time: string
}
export interface HealthEvent {
  id_event: number
  id_pet: number
  event_type: EventType
  title: string
  event_date: string
  event_place: string
  next_due_date: string | null
  status: EventStatus
  pet?: { name_pet: string }
}
export interface EventsResponse {
  events: HealthEvent[]
}
export interface EventResponse {
  event: HealthEvent
}
export interface CreateEventDTO {
  id_pet: number
  event_type: EventType
  title: string
  event_date: string
  event_place: string
  next_due_date?: string
  status?: EventStatus
}
export interface UpdateEventDTO {
  title?: string
  event_date?: string
  event_place?: string
  next_due_date?: string
  status?: EventStatus
  event_type?: EventType
}

export interface AiConversation {
  id_conversation: number
  id_pet: number | null
  title: string
  created_at: string
  updated_at: string
}
export interface AiMessage {
  id_message?: number
  role: 'user' | 'assistant'
  content: string | null
  image_url: string | null
  created_at: string
}
export interface ConversationsResponse {
  conversations: AiConversation[]
}
export interface ConversationResponse {
  conversation: AiConversation
  messages: AiMessage[]
}
export interface SendMessageDTO {
  message?: string
  image_base64?: string
  image_mime_type?: string
  id_conversation?: number
  id_pet?: number
}
export interface SendMessageResponse {
  id_conversation: number
  reply: string
  image_url: string | null
}

export interface UpdateProfileDTO {
  name_user?: string
  gender?: string
  birth_date?: string
  profile_image_base64?: string
  profile_image_mime_type?: string
}