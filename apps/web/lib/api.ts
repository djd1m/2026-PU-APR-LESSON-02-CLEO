const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ─── Types ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UploadResponse {
  upload_id: string;
}

export interface CategoryBreakdown {
  name: string;
  total: number;
  percentage: number;
}

export interface Subscription {
  name: string;
  amount: number;
  isParasite: boolean;
  lastCharge: string;
}

export interface Recommendation {
  id: string;
  text: string;
  savingPotential: number;
}

export interface AnalysisResponse {
  id: string;
  status: 'processing' | 'completed' | 'error';
  roastMessage: string;
  roastStyle: 'roast' | 'hype';
  totalSpent: number;
  categories: CategoryBreakdown[];
  subscriptions: Subscription[];
  recommendations: Recommendation[];
}

export interface RoastResponse {
  roastMessage: string;
  roastStyle: 'roast' | 'hype';
}

export interface ShareCardResponse {
  imageUrl: string;
  shareUrl: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'GET',
      headers: authHeaders(),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body.message || `Ошибка ${res.status}` };
    }

    const json = await res.json();
    return { data: json.data ?? json };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Неизвестная ошибка' };
  }
}

export async function apiPost<T>(
  path: string,
  body?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { error: json.error?.message || json.message || `Ошибка ${res.status}` };
    }

    const json = await res.json();
    return { data: json.data ?? json };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Неизвестная ошибка' };
  }
}

// ─── API Functions ───────────────────────────────────────────────────

export async function login(
  email: string,
  password: string
): Promise<ApiResponse<AuthResponse>> {
  return apiPost<AuthResponse>('/api/auth/login', { email, password });
}

export async function register(
  name: string,
  age: number,
  email: string,
  password: string
): Promise<ApiResponse<AuthResponse>> {
  return apiPost<AuthResponse>('/api/auth/register', {
    name,
    age,
    email,
    password,
  });
}

export async function uploadCsv(file: File): Promise<ApiResponse<UploadResponse>> {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { error: json.error?.message || json.message || `Ошибка ${res.status}` };
    }

    const json = await res.json();
    return { data: json.data ?? json };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Неизвестная ошибка' };
  }
}

export async function getAnalysis(
  id: string
): Promise<ApiResponse<AnalysisResponse>> {
  return apiGet<AnalysisResponse>(`/api/analysis/${id}`);
}

export async function requestRoast(
  analysisId: string,
  style: 'roast' | 'hype' = 'roast'
): Promise<ApiResponse<RoastResponse>> {
  return apiPost<RoastResponse>('/api/roast', { analysis_id: analysisId, style });
}

export async function generateShareCard(
  analysisId: string
): Promise<ApiResponse<ShareCardResponse>> {
  return apiPost<ShareCardResponse>(`/api/analysis/${analysisId}/share`);
}
