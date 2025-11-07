import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css'],
})
export class OrderConfirmationComponent implements OnInit {
  orderId: string | number | null = null;
  total: number = 0;
  shipping: any = null;
  paymentMethod: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const navState = nav?.extras?.state as any | undefined;

    const histState =
      typeof window !== 'undefined' && history && history.state
        ? (history.state as any)
        : undefined;

    const state = navState ?? histState;

    if (state) {
      this.orderId = state.orderId ?? state.orderID ?? null;
      this.total = state.total ?? 0;
      this.shipping = state.shipping ?? null;
      this.paymentMethod = state.paymentMethod ?? state.paymentMethodName ?? null;
    } else {
      this.orderId = null;
      this.total = 0;
      this.shipping = null;
      this.paymentMethod = null;
    }
  }
}
