import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize, timeout } from 'rxjs/operators';
import { OrderHistoryService, OrdersPage } from '../services/OrderHistoryService';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: any[] = [];
  loading = false;
  error: string | null = null;

  page = 1;
  take = 5;
  skip = 0;
  totalRows = 0;
  totalPages = 0;

  expandedOrderId: any = null;

  showContent = false;
  showDelay = 400;
  private showTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private svc: OrderHistoryService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPage(1);
  }

  ngOnDestroy(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  private scheduleShowContent() {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }

    this.showTimer = setTimeout(() => {
      this.showContent = true;
      this.showTimer = null;
      this.cdr.detectChanges();
    }, this.showDelay);
  }

  loadPage(p: number = 1) {
    this.page = p;
    this.skip = (this.page - 1) * this.take;

    // start loading state
    this.loading = true;
    this.error = null;
    this.showContent = false;

    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }

    this.svc
      .listOrders(this.take, this.skip)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.loading = false;
          this.scheduleShowContent();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: OrdersPage) => {
          if (!res.success) {
            this.error = res.message ?? 'No se pudieron cargar los pedidos';
            this.orders = [];
            this.totalRows = 0;
            this.totalPages = 0;
          } else {
            this.orders = res.ordersArray || [];
            this.totalRows = res.totalRows || 0;
            this.totalPages =
              res.totalPages || Math.max(1, Math.ceil((this.totalRows || 0) / this.take));
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error cargando pedidos', err);

          if (err?.name === 'TimeoutError' || err?.message?.toLowerCase()?.includes('timeout')) {
            this.error = 'La petición tardó demasiado tiempo. Intenta de nuevo.';
          } else {
            this.error = err?.message || 'Error al cargar pedidos';
          }
          this.orders = [];
          this.totalRows = 0;
          this.totalPages = 0;

          this.cdr.detectChanges();
        },
      });
  }

  toggleExpand(order: any) {
    if (this.expandedOrderId === this.getOrderId(order)) this.expandedOrderId = null;
    else this.expandedOrderId = this.getOrderId(order);
  }

  isExpanded(order: any) {
    return this.expandedOrderId === this.getOrderId(order);
  }

  getOrderId(o: any) {
    return o?.id ?? o?.ID ?? o?.orden_id ?? o?.orderId ?? o?.order_id ?? null;
  }

  getOrderDate(o: any) {
    return o?.fecha ?? o?.date ?? o?.created_at ?? o?.createdAt ?? null;
  }

  getOrderTotal(o: any) {
    return o?.total ?? o?.Total ?? o?.importe ?? o?.monto ?? 0;
  }

  getOrderItems(o: any): any[] {
    if (!o) return [];
    const candidates = [
      'articulos',
      'items',
      'detalles',
      'productos',
      'rows',
      'lines',
      'orderItems',
    ];
    for (const k of candidates) {
      if (Array.isArray(o[k])) return o[k];
    }

    if (Array.isArray(o)) return o;

    for (const k of Object.keys(o)) {
      if (Array.isArray(o[k])) return o[k];
    }
    return [];
  }

  itemTitle(it: any) {
    return (
      it?.descripcion ??
      it?.title ??
      it?.name ??
      it?.producto ??
      it?.nombre ??
      `Artículo ${it?.articulo_id ?? ''}`
    );
  }

  itemQty(it: any) {
    return it?.qty ?? it?.cantidad ?? it?.cantidad_articulo ?? 1;
  }

  itemPrice(it: any) {
    return it?.precio ?? it?.price ?? it?.importe ?? it?.monto ?? 0;
  }

  prevPage() {
    if (this.page > 1) this.loadPage(this.page - 1);
  }

  nextPage() {
    if (this.page < this.totalPages) this.loadPage(this.page + 1);
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.loadPage(p);
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
