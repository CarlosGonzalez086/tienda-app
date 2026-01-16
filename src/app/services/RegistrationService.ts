import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

export interface DtoCliente {
  id: number;
  nombre: string;
  apellidos?: string;
  direccion: string;
  correo_electronico: string;
  contrasena: string;
}

export interface ApiResponse {
  codigo: string;
  mensaje: string;
  respuesta?: any;
}

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private url =
    (environment.apiUrl ?? '').replace(/\/$/, '') + '/Cliente';

  constructor(private http: HttpClient) {}

  saveClient(payload: DtoCliente): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.url, payload);
  }
}
