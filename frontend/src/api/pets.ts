import { api } from './client'
import type { Pet, PetsResponse, PetResponse, CreatePetDTO, UpdatePetDTO } from './types'

export async function getPets(token: string): Promise<Pet[]> {
  const res = await api.get<PetsResponse>('/api/pets', token)
  return res.pets
}

export async function getPet(id: number, token: string): Promise<Pet> {
  const res = await api.get<PetResponse>(`/api/pets/${id}`, token)
  return res.pet
}

export async function createPet(data: CreatePetDTO, token: string): Promise<Pet> {
  const res = await api.post<PetResponse>('/api/pets', data, token)
  return res.pet
}

export async function updatePet(id: number, data: UpdatePetDTO, token: string): Promise<Pet> {
  const res = await api.put<PetResponse>(`/api/pets/${id}`, data, token)
  return res.pet
}

export async function deletePet(id: number, token: string): Promise<void> {
  await api.del(`/api/pets/${id}`, token)
}