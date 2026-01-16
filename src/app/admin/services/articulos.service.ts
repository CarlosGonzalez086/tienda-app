import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environment/environment';

export interface Articulos {
  id: number;
  codigo: string;
  descripcion: string;
  precio: string;
  imagen: string;
  stock: string;
}

interface ResponseApi<T> {
  codigo: string;
  mensaje: string;
  respuesta: T;
}

@Injectable({
  providedIn: 'root',
})
export class ArticulosService {
  private apiUrl = environment.apiUrl + '/Articulos';

  constructor(private http: HttpClient) {}

  obtenerArticulo(id: number): Observable<Articulos> {
    return this.http
      .get<ResponseApi<Articulos>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.respuesta));
  }

  obtenerArticulos(): Observable<Articulos[]> {
    return this.http
      .get<ResponseApi<Articulos[]>>(`${this.apiUrl}/all`)
      .pipe(map((res) => res.respuesta));
  }

  guardarArticulo(data: Articulos): Observable<ResponseApi<any>> {
    return this.http.post<ResponseApi<any>>(this.apiUrl, data);
  }

  actualizarArticulo(data: Articulos): Observable<ResponseApi<any>> {
    return this.http.put<ResponseApi<any>>(this.apiUrl, data);
  }

  eliminarArticulo(id: number): Observable<ResponseApi<any>> {
    return this.http.delete<ResponseApi<any>>(`${this.apiUrl}/${id}`);
  }
}
