import type { CVData } from '../types/cv';

const BASE_URL = import.meta.env.PUBLIC_API_URL;

async function apiRequest<T>(
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody.detail || 'API Request Failed');
    (error as { status?: number }).status = response.status;
    throw error;
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

interface CVListItem {
  id: string;
  title: string;
  content: CVData;
  language: string;
  updated_at: string;
  theme: string;
}

interface CVDetail {
  id: string;
  title: string;
  content: CVData;
  language: string;
}

export const api = {
  // User Profile
  getUserProfile: (token: string | null) =>
    apiRequest<{ id: string; is_pro: boolean }>(`/users/me?_t=${Date.now()}`, token),

  // CV CRUD
  getCVs: (token: string | null) => apiRequest<CVListItem[]>(`/cvs/?_t=${Date.now()}`, token),

  getCV: (id: string, token: string | null) =>
    apiRequest<CVDetail>(`/cvs/${id}?_t=${Date.now()}`, token),

  createCV: (
    data: { id: string; title: string; content: CVData; language?: string },
    token: string | null
  ) =>
    apiRequest<{ id: string }>('/cvs/', token, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCV: (
    id: string,
    data: { title?: string; content?: CVData; language?: string },
    token: string | null
  ) =>
    apiRequest<{ id: string }>(`/cvs/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCV: (id: string, token: string | null) =>
    apiRequest<void>(`/cvs/${id}`, token, {
      method: 'DELETE',
    }),

  // AI Actions
  improveText: (text: string, context: string, token: string | null) =>
    apiRequest<{ improved_text: string }>('/ai/improve', token, {
      method: 'POST',
      body: JSON.stringify({ text, context }),
    }),

  simulateATS: (cv_content: CVData, job_description: string, token: string | null) =>
    apiRequest<{
      final_ats_score: number;
      overall_interview_probability: number;
      tier_classification: string;
      hard_requirements_analysis: Array<{ requirement: string; status: string; comment: string }>;
      missing_keywords: string[];
      top_improvement_actions: string[];
    }>('/ai/ats', token, {
      method: 'POST',
      body: JSON.stringify({ cv_content, job_description }),
    }),

  generateCoverLetter: (cv_content: CVData, job_description: string, token: string | null) =>
    apiRequest<{ cover_letter: string }>('/ai/cover-letter', token, {
      method: 'POST',
      body: JSON.stringify({ cv_content, job_description }),
    }),

  createCheckoutSession: (plan_type: '7' | '30' | 'lifetime', token: string | null) =>
    apiRequest<{ url: string }>('/billing/create-checkout-session', token, {
      method: 'POST',
      body: JSON.stringify({ plan_type }),
    }),

  redeemPromo: (code: string, token: string | null) =>
    apiRequest<{ success: boolean; message: string; granted_days: number }>(
      '/promo/redeem',
      token,
      {
        method: 'POST',
        body: JSON.stringify({ code }),
      }
    ),
};
