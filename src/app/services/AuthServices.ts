import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environment/environment';
import { LoginResponse, User } from './auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  isLoggedIn$ = this.user$.pipe(map(Boolean));

  private readonly tokenKey = 'miapp_token';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const token = localStorage.getItem(this.tokenKey);
      if (token) {
        const user = this.parseUserFromToken(token);
        if (user) this.userSubject.next(user);
      }
    }
  }

  login(email: string, password: string) {
    const url = `${environment.apiUrl}/ClienteAcceso/login`;
    const body = {
      correo_electronico: email,
      contrasena: password,
    };

    return this.http.post<LoginResponse>(url, body).pipe(
      tap((resp) => {
        if (resp.codigo === '200' && resp.respuesta?.token) {
          const token = resp.respuesta.token;

          if (this.isBrowser) {
            localStorage.setItem(this.tokenKey, token);
          }

          const user = this.parseUserFromToken(token);
          this.userSubject.next(user);
        }
      })
    );
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
    }
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(this.tokenKey) : null;
  }

  // ================= JWT =================

  private parseUserFromToken(token: string): User | null {
    const payload = this.parseJwtPayload(token);
    if (!payload) return null;

    return {
      id: payload.sub ?? payload.id,
      name: payload.name ?? payload.nombre,
      email: payload.email ?? payload.correo,
      avatarUrl: payload.avatar,
    };
  }

  private parseJwtPayload(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
      return null;
    }
  }
}
