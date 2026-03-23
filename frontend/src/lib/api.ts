/**
 * API Client for BICS Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  errors?: any[];
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'An error occurred',
          errors: data.errors,
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: 'Network error. Please check your connection.' };
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // PUT request
  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload
  async upload<T>(endpoint: string, file: File, fieldName: string = 'file'): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const formData = new FormData();
    formData.append(fieldName, file);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Upload failed' };
      }

      return { data };
    } catch (error) {
      console.error('Upload failed:', error);
      return { error: 'Upload failed. Please try again.' };
    }
  }
}

// Create singleton instance
export const api = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: any }>('/auth/login', { email, password }),

  register: (data: { email: string; password: string; name: string; role: string; companyName?: string }) =>
    api.post<{ token: string; user: any }>('/auth/register', data),

  getMe: () => api.get<any>('/auth/me'),

  setupAdmin: (email: string, password: string, name: string) =>
    api.post<{ token: string; user: any }>('/auth/admin/setup', { email, password, name }),
};

// Student API
export const studentApi = {
  getProfile: () => api.get<any>('/students/profile'),

  updateProfile: (data: any) => api.put<any>('/students/profile', data),

  uploadResume: (file: File) => api.upload<{ resumeUrl: string }>('/students/profile/resume', file, 'resume'),

  uploadAvatar: (file: File) => api.upload<{ avatarUrl: string }>('/students/profile/avatar', file, 'avatar'),

  getApplications: (status?: string) =>
    api.get<any[]>(`/students/applications${status ? `?status=${status}` : ''}`),

  applyToJob: (jobId: string, coverLetter?: string) =>
    api.post<any>('/students/applications', { jobId, coverLetter }),

  withdrawApplication: (id: string) => api.delete<any>(`/students/applications/${id}`),

  acceptApplication: (id: string) => api.put<any>(`/students/applications/${id}/accept`, {}),
};

// Employer API
export const employerApi = {
  getProfile: () => api.get<any>('/employers/profile'),

  updateProfile: (data: any) => api.put<any>('/employers/profile', data),

  getJobs: (status?: string) =>
    api.get<any[]>(`/employers/jobs${status ? `?status=${status}` : ''}`),

  createJob: (data: any) => api.post<any>('/employers/jobs', data),

  updateJob: (id: string, data: any) => api.put<any>(`/employers/jobs/${id}`, data),

  deleteJob: (id: string) => api.delete<any>(`/employers/jobs/${id}`),

  getJobApplications: (jobId: string) => api.get<any[]>(`/employers/jobs/${jobId}/applications`),

  updateApplicationStatus: (id: string, status: string) =>
    api.put<any>(`/employers/applications/${id}/status`, { status }),

  getCandidates: () => api.get<any[]>('/employers/candidates'),
};

// Jobs API (Public)
export const jobsApi = {
  list: (params?: { search?: string; location?: string; type?: string; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.location) searchParams.set('location', params.location);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.page) searchParams.set('page', String(params.page));

    const query = searchParams.toString();
    return api.get<{ jobs: any[]; pagination: any }>(`/jobs${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => api.get<any>(`/jobs/${id}`),
};

// Admin API
export const adminApi = {
  getStudents: (params?: { search?: string; status?: string; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', String(params.page));

    const query = searchParams.toString();
    return api.get<{ students: any[]; pagination: any }>(`/admin/students${query ? `?${query}` : ''}`);
  },

  getEmployers: (params?: { search?: string; verified?: boolean; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.verified !== undefined) searchParams.set('verified', String(params.verified));
    if (params?.page) searchParams.set('page', String(params.page));

    const query = searchParams.toString();
    return api.get<{ employers: any[]; pagination: any }>(`/admin/employers${query ? `?${query}` : ''}`);
  },

  verifyEmployer: (id: string, verified: boolean = true) =>
    api.put<any>(`/admin/employers/${id}/verify`, { verified }),

  deleteUser: (id: string) => api.delete<any>(`/admin/users/${id}`),

  getAnalytics: () => api.get<any>('/admin/analytics'),
};

// Notifications API
export const notificationsApi = {
  list: (unreadOnly?: boolean) =>
    api.get<any[]>(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`),

  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),

  markAsRead: (id: string) => api.put<any>(`/notifications/${id}/read`, {}),

  markAllAsRead: () => api.put<any>('/notifications/read-all', {}),
};
