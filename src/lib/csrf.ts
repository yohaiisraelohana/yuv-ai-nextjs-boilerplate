import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

export function generateCSRFToken(): string {
  const token = randomBytes(32).toString('hex');
  cookies().set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600, // 1 hour
  });
  return token;
}

export function validateCSRFToken(token: string): boolean {
  const storedToken = cookies().get('csrf-token')?.value;
  if (!storedToken || storedToken !== token) {
    return false;
  }
  return true;
}

// Client-side functions to work with CSRF tokens
export const clientCSRF = {
  getCSRFFromMeta: (): string | null => {
    if (typeof document === 'undefined') return null; 
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    return csrfMeta ? csrfMeta.getAttribute('content') : null;
  },
  
  attachCSRFToFormData: (formData: FormData): FormData => {
    const token = clientCSRF.getCSRFFromMeta();
    if (token) {
      formData.append('csrf-token', token);
    }
    return formData;
  },
  
  attachCSRFToHeaders: (headers: HeadersInit = {}): HeadersInit => {
    const token = clientCSRF.getCSRFFromMeta();
    if (token) {
      const newHeaders = new Headers(headers);
      newHeaders.append('X-CSRF-Token', token);
      return newHeaders;
    }
    return headers;
  }
}; 