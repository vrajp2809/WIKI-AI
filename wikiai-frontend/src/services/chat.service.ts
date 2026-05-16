import { api } from './api';

export const chatService = {
  getSessions: () => api.get('/chat/sessions'),
  createSession: (topic?: string, title?: string) => api.post('/chat/sessions', { topic, title }),
  getSession: (id: string) => api.get(`/chat/sessions/${id}`),
  sendMessage: (sessionId: string, content: string, topic?: string) =>
    api.post(`/chat/sessions/${sessionId}/messages`, { content, topic }),
};
