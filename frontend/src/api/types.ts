export type PetSpecies = 'PERRO' | 'GATO' | 'CONEJO' | 'PAJARO' | 'OTHER'

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
