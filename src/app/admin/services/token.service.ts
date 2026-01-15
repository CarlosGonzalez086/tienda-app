import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  }

  getAdminName(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminName');
  }

  setToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('adminToken', token);
  }

  setAdminName(name: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('adminName', name);
  }

  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
  }
}
