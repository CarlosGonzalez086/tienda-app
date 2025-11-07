import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { AuthService } from './AuthServices';


export interface DtoArticuloClienteDetalle {
  id?: number;
  articulo_id: number;
  cantidad: number;
  id_cliente_articulo?: number;
}

export interface DtoArticuloCliente {
  id?: number;
  total: number;
  cliente_id: number;
  articulos: DtoArticuloClienteDetalle[];
}

export interface ApiResponse {
  codigo: string;
  mensaje: string;
  respuesta?: any;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private url = (environment.apiUrl ?? '').replace(/\/$/, '') + '/CompraCliente';

  constructor(private http: HttpClient, private auth: AuthService) {}

  saveOrder(payload: DtoArticuloCliente): Observable<ApiResponse> {
    const token = (this.auth && typeof (this.auth as any).getToken === 'function') ? (this.auth as any).getToken() : null;
    let headers = undefined;
    if (token) {
      headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return this.http.post<ApiResponse>(this.url, payload, headers ? { headers } : {});
  }
}