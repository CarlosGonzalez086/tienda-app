import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface CartItem {
  id: number | string;
  title: string;
  price: number;
  qty: number;
  image?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  private countSubject = new BehaviorSubject<number>(0);
  count$ = this.countSubject.asObservable();

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      const raw = localStorage.getItem('miapp_cart');
      if (raw) {
        try {
          const parsed: CartItem[] = JSON.parse(raw);
          this.itemsSubject.next(parsed);
          this.updateCount(parsed);
        } catch {}
      }
    }
  }

  private persist(items: CartItem[]) {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('miapp_cart', JSON.stringify(items));
    } catch {}
  }

  private updateCount(items: CartItem[]) {
    const total = items.reduce((s, it) => s + (it.qty || 0), 0);
    this.countSubject.next(total);
  }

  getItems(): CartItem[] {
    return this.itemsSubject.value.slice();
  }

  addItem(item: CartItem) {
    const items = this.getItems();
    const idx = items.findIndex((i) => String(i.id) === String(item.id));
    if (idx >= 0) {
      items[idx].qty += item.qty || 1;
    } else {
      items.push({ ...item, qty: item.qty || 1 });
    }
    this.itemsSubject.next(items);
    this.updateCount(items);
    this.persist(items);
  }

  setQuantity(id: number | string, qty: number) {
    const items = this.getItems();
    const idx = items.findIndex((i) => String(i.id) === String(id));
    if (idx >= 0) {
      items[idx].qty = Math.max(0, Math.floor(qty));
      if (items[idx].qty === 0) items.splice(idx, 1);
      this.itemsSubject.next(items);
      this.updateCount(items);
      this.persist(items);
    }
  }

  removeItem(id: number | string) {
    const items = this.getItems().filter((i) => String(i.id) !== String(id));
    this.itemsSubject.next(items);
    this.updateCount(items);
    this.persist(items);
  }

  clear() {
    this.itemsSubject.next([]);
    this.updateCount([]);
    if (this.isBrowser) localStorage.removeItem('miapp_cart');
  }

  getTotal(): number {
    return this.getItems().reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);
  }

  setItems(items: CartItem[]) {
    this.itemsSubject.next(items || []);
    this.updateCount(items || []);
    this.persist(items || []);
  }
}