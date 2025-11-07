import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environment/environment';

export interface User {
  id?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  isLoggedIn$ = this.user$.pipe(map((u) => !!u));

  private tokenKey = 'miapp_token';
  private isBrowser: boolean;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      const t = localStorage.getItem(this.tokenKey);
      if (t) {
        const user = this.parseUserFromToken(t);
        if (user) this.userSubject.next(user);
      }
    }
  }

  login(email: string, password: string) {
    const url = `${environment.apiUrl}/ClienteAcceso`;
    const body = { correo_electronico: email, contrasena: password };

    return this.http.post<any>(url, body).pipe(
      tap((resp) => {
        const token = resp?.respuesta?.token;
        if (resp?.codigo === '200' && token) {
          if (this.isBrowser) localStorage.setItem(this.tokenKey, token);
          const user = this.parseUserFromToken(token);
          if (user) this.userSubject.next(user);
        } else {
          this.logout();
        }
      })
    );
  }

  logout() {
    if (this.isBrowser) localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.tokenKey);
  }

  private parseJwtPayload(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      if (this.isBrowser && typeof window !== 'undefined' && typeof window.atob === 'function') {
        const json = decodeURIComponent(escape(window.atob(base64)));
        return JSON.parse(json);
      }
      if (typeof (globalThis as any).Buffer !== 'undefined') {
        const buff = (globalThis as any).Buffer.from(base64, 'base64').toString('utf8');
        return JSON.parse(buff);
      }
      return null;
    } catch (e) {
      console.warn('parseJwtPayload error', e);
      return null;
    }
  }

  private parseUserFromToken(token: string): User | null {
    const payload = this.parseJwtPayload(token);
    if (!payload) return null;
    const user: User = {
      id: payload.sub ?? payload.nameid ?? payload.id,
      name: payload.name ?? payload.unique_name ?? payload.nombre_completo,
      email: payload.email ?? payload.correo,
      avatarUrl: payload.avatar ?? payload.imagen,
    };
    return user;
  }
}
