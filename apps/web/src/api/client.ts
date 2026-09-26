import axios from 'axios';
import { FilterCategory, SortBy, SortOrder } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5050/api/v1');

export const api = axios.create({
  baseURL: API_BASE_URL
});

// Request interceptor: add Bearer accessToken
api.interceptors.request.use((config) => {
  const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
          const newAccessToken = res.data.data.accessToken;
          const newRefreshToken = res.data.data.refreshToken;
          storage.set(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
          storage.set(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch {
          storage.clearAuth();
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (data: any) => {
    const res = await api.post('/auth/login', data);
    return res.data.data;
  },
  register: async (data: any) => {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  },
  verifyEmail: async (email: string, code: string) => {
    const res = await api.post('/auth/verify-email', { email, code });
    return res.data.data;
  },
  resendVerification: async (email: string) => {
    const res = await api.post('/auth/resend-verification', { email });
    return res.data.data;
  },
  refreshToken: async (refreshToken: string) => {
    const res = await api.post('/auth/refresh-token', { refreshToken });
    return res.data.data;
  },
  logout: async (refreshToken?: string) => {
    const res = await api.post('/auth/logout', { refreshToken });
    return res.data.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data.data;
  }
};

// Folders API
export const folderApi = {
  create: async (name: string, parentFolder?: string | null, color?: string) => {
    const res = await api.post('/folders', { name, parentFolder, color });
    return res.data.data;
  },
  getFolders: async (params: { parentFolder?: string | null; isStarred?: boolean; isTrash?: boolean; search?: string }) => {
    const res = await api.get('/folders', { params });
    return res.data.data;
  },
  getPath: async (id: string) => {
    const res = await api.get(`/folders/${id}/path`);
    return res.data.data;
  },
  rename: async (id: string, name: string) => {
    const res = await api.patch(`/folders/${id}/rename`, { name });
    return res.data.data;
  },
  toggleStar: async (id: string) => {
    const res = await api.patch(`/folders/${id}/star`);
    return res.data.data;
  },
  trash: async (id: string) => {
    const res = await api.patch(`/folders/${id}/trash`);
    return res.data.data;
  },
  restore: async (id: string) => {
    const res = await api.patch(`/folders/${id}/restore`);
    return res.data.data;
  },
  deletePermanently: async (id: string) => {
    const res = await api.delete(`/folders/${id}`);
    return res.data.data;
  }
};

// Files API
export const fileApi = {
  uploadWithProgress: async (
    files: File[],
    folderId: string | null | undefined,
    onProgress: (percent: number, loaded: number, total: number) => void
  ) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (folderId) {
      formData.append('folderId', folderId);
    }

    const res = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent, progressEvent.loaded, progressEvent.total);
        }
      }
    });
    return res.data.data;
  },
  getFiles: async (params: {
    folder?: string | null;
    category?: FilterCategory;
    search?: string;
    isStarred?: boolean;
    isTrash?: boolean;
    sortBy?: SortBy;
    sortOrder?: SortOrder;
  }) => {
    const res = await api.get('/files', { params });
    return res.data.data;
  },
  rename: async (id: string, name: string) => {
    const res = await api.patch(`/files/${id}/rename`, { name });
    return res.data.data;
  },
  toggleStar: async (id: string) => {
    const res = await api.patch(`/files/${id}/star`);
    return res.data.data;
  },
  trash: async (id: string) => {
    const res = await api.patch(`/files/${id}/trash`);
    return res.data.data;
  },
  restore: async (id: string) => {
    const res = await api.patch(`/files/${id}/restore`);
    return res.data.data;
  },
  deletePermanently: async (id: string) => {
    const res = await api.delete(`/files/${id}`);
    return res.data.data;
  }
};

// Share API
export const shareApi = {
  shareItem: async (type: 'file' | 'folder', id: string, email: string, role: 'viewer' | 'editor') => {
    const res = await api.post(`/share/${type}/${id}`, { email, role });
    return res.data.data;
  },
  removeShare: async (type: 'file' | 'folder', id: string, email: string) => {
    const res = await api.post(`/share/${type}/${id}/remove`, { email });
    return res.data.data;
  },
  togglePublicLink: async (fileId: string) => {
    const res = await api.post(`/share/file/${fileId}/public-link`);
    return res.data.data;
  },
  getSharedWithMe: async () => {
    const res = await api.get('/share/shared-with-me');
    return res.data.data;
  },
  getPublicItem: async (token: string) => {
    const res = await api.get(`/share/public/${token}`);
    return res.data.data;
  }
};
