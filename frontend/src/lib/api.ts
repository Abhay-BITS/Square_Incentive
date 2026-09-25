const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080';

export interface UploadResponse {
  success: boolean;
  rmRows?: Record<string, unknown>[];
  dlRows?: Record<string, unknown>[];
  error?: string;
}

export function uploadWorkbook(file: File, onUploadProgress?: (fraction: number) => void): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/api/upload`);
    xhr.responseType = 'json';
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onUploadProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      const data = xhr.response as UploadResponse | null;
      if (data && typeof data === 'object') resolve(data);
      else resolve({ success: false, error: `Upload failed (${xhr.status})` });
    };
    xhr.onerror = () =>
      reject(new Error('Could not reach the server. It may be waking up, so please try again in a moment.'));
    xhr.ontimeout = () => reject(new Error('The server took too long to respond. Please try again.'));
    const form = new FormData();
    form.append('file', file);
    xhr.send(form);
  });
}
