import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://document-summarizer-wplp.onrender.com/api'
    : '/api');

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

// Response interceptor: extract error message safely
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let customMessage = 'An unexpected error occurred. Please try again.';

    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'string') {
        customMessage = data;
      } else if (typeof data.message === 'string') {
        customMessage = data.message;
      } else if (typeof data.error === 'string') {
        customMessage = data.error;
      } else if (data.error && typeof data.error.message === 'string') {
        customMessage = data.error.message;
      } else if (Array.isArray(data.errors)) {
        customMessage = data.errors
          .map((e) => (typeof e === 'string' ? e : e?.message || JSON.stringify(e)))
          .join(', ');
      } else if (typeof data === 'object') {
        try {
          if (data.message && typeof data.message === 'object') {
            customMessage = JSON.stringify(data.message);
          } else {
            customMessage = JSON.stringify(data);
          }
        } catch {
          customMessage = 'Server error occurred.';
        }
      }
    } else if (error.message) {
      customMessage = typeof error.message === 'string' ? error.message : 'Network error occurred.';
    }

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
