import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginResponse {
  token: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private apiUrlCrear = 'https://localhost:7151/api/admin';
  private apiUrlAuth = 'https://localhost:7151/api/Auth';

  constructor(private http: HttpClient) {}

  login(correoElectronico: string, contrasena: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrlAuth}/login`, { correoElectronico, contrasena });
  }

  register(nombre: string, correoElectronico: string, contrasena: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrlCrear}`, { nombre, correoElectronico, contrasena });
  }

  logout() {
    localStorage.removeItem('adminToken');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('adminToken');
  }
}
