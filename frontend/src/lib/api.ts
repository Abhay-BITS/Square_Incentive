const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080';

export interface UploadResponse {
  success: boolean;
  rmRows?: Record<string, unknown>[];
  dlRows?: Record<string, unknown>[];
  error?: string;
}

export async function uploadWorkbook(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE_URL}/api/upload`, { method: 'POST', body: form });
  const data = (await res.json()) as UploadResponse;
  if (!res.ok && data.success === undefined) {
    return { success: false, error: `Upload failed (${res.status})` };
  }
  return data;
}
