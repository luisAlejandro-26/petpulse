import { api } from './client'
import type {
  ConversationsResponse,
  ConversationResponse,
  SendMessageDTO,
  SendMessageResponse,
} from './types'

export async function getConversations(token: string) {
  const res = await api.get<ConversationsResponse>('/api/ia/conversations', token)
  return res.conversations
}

export async function getConversation(id: number, token: string) {
  return api.get<ConversationResponse>(`/api/ia/conversations/${id}`, token)
}

export async function sendMessage(data: SendMessageDTO, token: string) {
  return api.post<SendMessageResponse>('/api/ia/chat', data, token)
}

export async function deleteConversation(id: number, token: string) {
  await api.del(`/api/ia/conversations/${id}`, token)
}