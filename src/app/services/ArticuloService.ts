import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environment/environment';

export interface Articulo {
  id: number;
  codigo?: string;
  name?: string;
  descripcion?: string;
  description?: string;
  precio: number;
  price?: number;
  imagen?: string | null;
  stock?: number;
  TotalRegistros?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

interface ApiWrapper {
  codigo?: string;
  mensaje?: string;
  respuesta?: {
    data?: any;
    totalRows?: number;
    totalPages?: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ArticuloService {
  private apiUrl = environment.apiUrl;
  private baseUrl = this.apiUrl + '/Articulos';

  constructor(private http: HttpClient) {}

  getArticles(page: number = 1, pageSize: number = 12): Observable<PagedResult<Articulo>> {
    const iTake = pageSize;
    const iSkip = (page - 1) * pageSize;

    const params = new HttpParams().set('iTake', iTake.toString()).set('iSkip', iSkip.toString());

    return this.http.get<ApiWrapper>(`${this.baseUrl}/lista`, { params }).pipe(
      map((wrapper) => {
        const resp = wrapper?.respuesta;
        if (!resp) {
          return { items: [], totalCount: 0, page, pageSize: iTake } as PagedResult<Articulo>;
        }

        let parsed: any = resp.data;
        if (typeof parsed === 'string' && parsed.length > 0) {
          try {
            parsed = JSON.parse(parsed);
          } catch (e) {
            console.warn('ArticuloService: no se pudo parsear respuesta.respuesta.data', e);
            parsed = null;
          }
        }

        let itemsRaw: any[] = [];
        let totalCount = 0;

        if (parsed && Array.isArray(parsed.Item1)) {
          itemsRaw = parsed.Item1;
          if (parsed.Item2 != null) {
            totalCount = Number(parsed.Item2) || 0;
          }
        } else if (Array.isArray(resp.data)) {
          itemsRaw = resp.data;
        } else {
          if (parsed) {
            const firstArray = Object.values(parsed).find((v) => Array.isArray(v));
            if (Array.isArray(firstArray)) {
              itemsRaw = firstArray as any[];
            }
            if (!totalCount && parsed.totalRows) {
              totalCount = Number(parsed.totalRows) || totalCount;
            }
          }

          if (!totalCount && typeof resp.totalRows === 'number') {
            totalCount = resp.totalRows;
          }
        }

        if (!totalCount) {
          if (itemsRaw.length > 0) {
            const possible = itemsRaw[0]?.TotalRegistros ?? itemsRaw[0]?.totalRegistros;
            if (typeof possible === 'number') totalCount = possible;
            else totalCount = itemsRaw.length;
          } else {
            totalCount = 0;
          }
        }

        const items: Articulo[] = Array.isArray(itemsRaw)
          ? itemsRaw.map((it) => this.mapToArticulo(it))
          : [];

        return {
          items,
          totalCount,
          page,
          pageSize: iTake,
        } as PagedResult<Articulo>;
      }),
      catchError((err) => {
        console.error('Error en getArticles', err);
        return of({ items: [], totalCount: 0, page, pageSize: iTake } as PagedResult<Articulo>);
      })
    );
  }

  private mapToArticulo(a: any): Articulo {
    return {
      id: a?.id ?? a?.ID ?? 0,
      codigo: a?.codigo ?? a?.Codigo ?? a?.code ?? null,
      descripcion: a?.descripcion ?? a?.description ?? a?.name ?? null,
      price: a?.precio ?? a?.price ?? 0,
      precio: a?.precio ?? a?.price ?? 0,
      imagen: a?.imagen ?? a?.image ?? null,
      stock: a?.stock ?? 0,
      TotalRegistros: a?.TotalRegistros ?? a?.totalRegistros ?? 0,
    } as Articulo;
  }
}
