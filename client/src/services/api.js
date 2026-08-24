import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('docu_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract error message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    const normalizedError = new Error(customMessage);
    normalizedError.status = error.response?.status;
    normalizedError.data = error.response?.data;
    return Promise.reject(normalizedError);
  }
);

// ================= AUTH APIS =================
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// ================= DOCUMENT APIS =================
export const documentService = {
  uploadDocument: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },
  getDocuments: async () => {
    const response = await api.get('/documents');
    return response.data;
  },
  getDocumentById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },
  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
  // Context-aware AI queries (scoped selections, pages, translations, flowcharts, custom prompts)
  sendAIQuery: async (id, queryData) => {
    const response = await api.post(`/documents/${id}/ai-query`, queryData);
    return response.data;
  },
  getInteractions: async (id) => {
    const response = await api.get(`/documents/${id}/interactions`);
    return response.data;
  },
  deleteInteraction: async (id, interactionId) => {
    const response = await api.delete(`/documents/${id}/interactions/${interactionId}`);
    return response.data;
  },
};

// ================= SUMMARY APIS =================
export const summaryService = {
  generateSummary: async (documentId, summaryLength = 'medium') => {
    const response = await api.post(`/summaries/${documentId}`, {
      summaryLength,
    });
    return response.data;
  },
  getSummary: async (documentId) => {
    const response = await api.get(`/summaries/${documentId}`);
    return response.data;
  },
  regenerateSummary: async (documentId, summaryLength = 'medium') => {
    const response = await api.post(`/summaries/${documentId}/regenerate`, {
      summaryLength,
    });
    return response.data;
  },
};

export default api;
