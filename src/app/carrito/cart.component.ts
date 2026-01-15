import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { CartItem, CartService } from '../services/CartService';
import { AuthService } from '../services/AuthServices';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent {
  items$!: Observable<CartItem[]>;
  total = 0;

  constructor(private cart: CartService, private auth: AuthService, private router: Router) {
    this.items$ = this.cart.items$;
    this.cart.items$.subscribe((list) => {
      this.total = list.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);
    });
  }

  increase(item: CartItem) {
    this.cart.setQuantity(item.id, (item.qty || 0) + 1);
  }

  decrease(item: CartItem) {
    this.cart.setQuantity(item.id, Math.max(0, (item.qty || 0) - 1));
  }

  remove(item: CartItem) {
    this.cart.removeItem(item.id);
  }

  clear() {
    this.cart.clear();
  }

  checkout() {
    this.auth.user$
      .subscribe((u) => {
        if (u) {
          this.router.navigate(['/checkout']);
        } else {
          this.router.navigate(['/login']);
        }
      })
      .unsubscribe();
  }
}
