import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Articulo, ArticuloService } from '../services/ArticuloService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environment/environment';
import { finalize, timeout } from 'rxjs/operators';
import { CartService } from '../services/CartService';

export interface CartItem {
  id: number | string;
  title: string;
  price: number;
  qty: number;
  image?: string;
}

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ArticlesComponent implements OnInit {
  articles: Articulo[] = [];
  page = 1;
  pageSize = 12;
  totalCount = 0;
  totalPages = 0;
  pageSizes = [6, 12, 24];
  loading = false;
  error = false;

  constructor(
    private articuloService: ArticuloService,
    private cart: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPage();
  }

  get pages(): any[] {
    return Array.from({ length: Math.max(0, this.totalPages) });
  }

  loadPage(page: number = this.page): void {
    this.loading = true;
    this.error = false;

    this.articuloService
      .getArticles(page, this.pageSize)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.articles = res.items.map((i) => this.normalizeArticulo(i));
          this.page = res.page;
          this.pageSize = res.pageSize;
          this.totalCount = res.totalCount;
          this.totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error en getArticles', err);
          this.error = true;
          this.articles = [];
          this.cdr.detectChanges();
          alert('Error al cargar los artículos: ' + (err?.message || 'Error desconocido'));
        },
      });
  }

  normalizeArticulo(a: any): Articulo {
    return {
      id: a.id ?? a.ID ?? 0,
      codigo: a.codigo ?? a.Codigo ?? a.code ?? null,
      descripcion: a.descripcion ?? a.description ?? a.name ?? null,
      price: a.precio ?? a.price ?? 0,
      precio: a.precio ?? a.price ?? 0,
      imagen: a.imagen ?? a.image ?? null,
      stock: a.stock ?? 0,
      TotalRegistros: a.TotalRegistros ?? a.totalRegistros ?? 0,
    } as Articulo;
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.page = 1;
    this.loadPage(1);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.loadPage(p);
  }

  prevPage(): void {
    if (this.page > 1) this.goToPage(this.page - 1);
  }

  nextPage(): void {
    if (this.page < this.totalPages) this.goToPage(this.page + 1);
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(p ?? 0);
  }

  imageSrc(a: any): string {
    if (!a.imagen) return '';
    if (a.imagen.startsWith('data:')) return a.imagen;
    if (/^https?:\/\//i.test(a.imagen)) return a.imagen;

    const api = (environment.apiUrl ?? '').replace(/\/$/, '');
    return api + a.imagen;
  }

  getCartQty(a: Articulo): number {
    const items = this.cart.getItems();
    const it = items.find((i) => String(i.id) === String(a.id));
    return it ? it.qty || 0 : 0;
  }

  addToCart(a: Articulo): void {
    const qty = 1;
    const item: CartItem = {
      id: a.id,
      title: a.descripcion ?? a.name ?? 'Artículo',
      price: Number(a.precio ?? a.price ?? 0) || 0,
      qty,
      image: this.imageSrc(a) || undefined,
    };
    this.cart.addItem(item);

    this.cdr.detectChanges();
  }

  increaseQty(a: Articulo): void {
    const current = this.getCartQty(a);
    if (current > 0) {
      this.cart.setQuantity(a.id, current + 1);
    } else {
      this.addToCart(a);
    }
    this.cdr.detectChanges();
  }

  decreaseQty(a: Articulo): void {
    const current = this.getCartQty(a);
    if (current <= 1) {
      this.removeFromCart(a);
    } else {
      this.cart.setQuantity(a.id, current - 1);
    }
    this.cdr.detectChanges();
  }

  removeFromCart(a: Articulo): void {
    this.cart.removeItem(a.id);
    this.cdr.detectChanges();
  }
}
