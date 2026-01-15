import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environment/environment';

export interface Tienda {
  id: number;
  sucursal: string;
  direccion: string;
}

interface ResponseApi<T> {
  codigo: string;
  mensaje: string;
  respuesta: T;
}

@Injectable({
  providedIn: 'root',
})
export class TiendaService {
  private apiUrl = environment.apiUrl + '/Tienda';

  constructor(private http: HttpClient) {}

  obtenerTienda(id: number): Observable<Tienda> {
    return this.http.get<ResponseApi<Tienda>>(`${this.apiUrl}/${id}`).pipe(
      map((res) => res.respuesta)
    );
  }

  obtenerTiendas(): Observable<Tienda[]> {
    return this.http.get<ResponseApi<Tienda[]>>(`${this.apiUrl}/all`).pipe(
      map((res) => res.respuesta)
    );
  }

  guardarTienda(data: Tienda): Observable<ResponseApi<any>> {
    return this.http.post<ResponseApi<any>>(this.apiUrl, data);
  }

  actualizarTienda(data: Tienda): Observable<ResponseApi<any>> {
    return this.http.put<ResponseApi<any>>(this.apiUrl, data);
  }

  eliminarTienda(id: number): Observable<ResponseApi<any>> {
    return this.http.delete<ResponseApi<any>>(`${this.apiUrl}/${id}`);
  }
}
