import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';

export const aiChatKeys = {
  conversations: ['ai', 'conversations'] as const,
  conversation: (id: string) => ['ai', 'conversation', id] as const,
};

interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
}

export function useConversationsQuery() {
  return useQuery({
    queryKey: aiChatKeys.conversations,
    queryFn: () => apiClient<{ conversations: Conversation[] }>('/api/ai/chat/conversations'),
  });
}

export function useConversationDetailQuery(id: string | null) {
  return useQuery({
    queryKey: aiChatKeys.conversation(id ?? ''),
    queryFn: () => apiClient<{ conversation: { id: string; title: string; messages: ChatMessage[] } }>(`/api/ai/chat/conversations/${id}`),
    enabled: !!id,
  });
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { message: string; conversationId?: string }) =>
      apiClient<{ conversationId: string; message: string }>('/api/ai/chat', { method: 'POST', body: data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: aiChatKeys.conversations });
      queryClient.invalidateQueries({ queryKey: aiChatKeys.conversation(data.conversationId) });
    },
  });
}

export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/ai/chat/conversations/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: aiChatKeys.conversations }),
  });
}
