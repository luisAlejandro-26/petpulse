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
}

export interface UpdatePetDTO {
  name_pet?: string
  species?: PetSpecies
  breed?: string
  birth_date?: string
  diseases?: string
  notes?: string
  pet_image_url?: string
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