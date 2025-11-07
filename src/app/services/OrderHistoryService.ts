import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environment/environment';
import { AuthService } from './AuthServices';


export interface RawApiResponse {
  codigo: string;
  mensaje: string;
  respuesta?: any;
}

export interface OrdersPage {
  success: boolean;
  message?: string;
  parsed?: any; // parsed dtInfo from backend
  ordersArray: any[]; // best-effort array of orders
  totalRows: number;
  totalPages: number;
  raw?: RawApiResponse;
}

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  private url = (environment.apiUrl ?? '').replace(/\/$/, '') + '/CompraCliente/lista';

  constructor(private http: HttpClient, private auth: AuthService) {}

  listOrders(take = 5, skip = 0): Observable<OrdersPage> {
    const token = (this.auth && typeof (this.auth as any).getToken === 'function') ? (this.auth as any).getToken() : null;
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    const params = `?iTake=${take}&iSkip=${skip}`;

    return this.http.get<RawApiResponse>(this.url + params, headers ? { headers } : {}).pipe(
      map(resp => {
        const result: OrdersPage = {
          success: resp?.codigo === '200',
          message: resp?.mensaje ?? null,
          parsed: null,
          ordersArray: [],
          totalRows: 0,
          totalPages: 0,
          raw: resp
        };

        try {
          const respuesta = resp?.respuesta ?? {};
          const rawData = respuesta?.data ?? null;

          if (rawData) {
            result.parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
          } else {
            result.parsed = respuesta;
          }

          const findArray = (obj: any): any[] => {
            if (!obj) return [];
            if (Array.isArray(obj)) return obj;

            const commonKeys = ['data', 'items', 'rows', 'lista', 'results', 'ordenes', 'orders'];
            for (const key of commonKeys) {
              if (Array.isArray(obj[key])) return obj[key];
            }

            for (const k of Object.keys(obj)) {
              if (Array.isArray((obj as any)[k])) return (obj as any)[k];
            }
            return [];
          };

          result.ordersArray = findArray(result.parsed);
          result.totalRows = Number(respuesta?.totalRows ?? respuesta?.filas ?? 0) || 0;
          result.totalPages = Number(respuesta?.totalPages ?? 0) || 0;
        } catch (e) {
          result.parsed = resp?.respuesta ?? null;
          result.ordersArray = [];
          result.totalRows = 0;
          result.totalPages = 0;
          result.message = 'Error al parsear la respuesta del servidor';
        }
        return result;
      })
    );
  }
}