import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable, Subscription, take } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CartItem } from '../home/articles.component';
import { CartService } from '../services/CartService';
import { AuthService } from '../services/AuthServices';
import {
  ApiResponse,
  DtoArticuloCliente,
  DtoArticuloClienteDetalle,
  OrderService,
} from '../services/OrderService';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  items$: Observable<CartItem[]>;
  total = 0;

  loading = false;
  error: string | null = null;

  shippingForm!: FormGroup;
  paymentForm!: FormGroup;

  private subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private cart: CartService,
    private auth: AuthService,
    private orderService: OrderService,
    private router: Router
  ) {
    this.items$ = this.cart.items$;

    this.cart.items$.subscribe((list) => {
      this.total = list.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);
    });
  }

  ngOnInit(): void {
    this.shippingForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      ciudad: ['', [Validators.required]],
      cp: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
    });

    this.paymentForm = this.fb.group({
      metodo: ['card', Validators.required], 
      cardNumber: [''],
      cardExp: [''],
      cardCvc: [''],
    });


    const sub = this.paymentForm.get('metodo')!.valueChanges.subscribe((v) => {
      const cardNumber = this.paymentForm.get('cardNumber')!;
      const cardExp = this.paymentForm.get('cardExp')!;
      const cardCvc = this.paymentForm.get('cardCvc')!;

      if (v === 'card') {
        cardNumber.setValidators([Validators.required, Validators.minLength(12)]);
        cardExp.setValidators([Validators.required]);
        cardCvc.setValidators([Validators.required, Validators.minLength(3)]);
      } else {
        cardNumber.clearValidators();
        cardExp.clearValidators();
        cardCvc.clearValidators();
      }

      cardNumber.updateValueAndValidity({ emitEvent: false });
      cardExp.updateValueAndValidity({ emitEvent: false });
      cardCvc.updateValueAndValidity({ emitEvent: false });
    });

    this.subs.add(sub);

    const current = this.paymentForm.get('metodo')!.value;
    this.paymentForm.get('metodo')!.setValue(current);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  backToCart() {
    this.router.navigate(['/cart']);
  }

  canSubmit(): boolean {
    if (this.shippingForm.invalid) return false;
    if (this.paymentForm.get('metodo')!.value === 'card') {
      return (
        this.paymentForm.get('cardNumber')!.valid &&
        this.paymentForm.get('cardExp')!.valid &&
        this.paymentForm.get('cardCvc')!.valid
      );
    }
    return true;
  }

  submitOrder() {
    this.error = null;
    if (!this.canSubmit()) {
      this.error = 'Completa el formulario de envío y los datos de pago.';
      return;
    }

    this.auth.user$.pipe(take(1)).subscribe((user) => {
      const clienteId = user && (user as any).id ? Number((user as any).id) : 0;

      const cartItems = this.cart.getItems();
      const detalles: DtoArticuloClienteDetalle[] = cartItems.map((ci) => ({
        articulo_id: Number(ci.id),
        cantidad: ci.qty || 1,
        id_cliente_articulo: 0,
      }));

      const payload: DtoArticuloCliente = {
        total: Number(this.total) || 0,
        cliente_id: clienteId,
        articulos: detalles,
      };

      this.loading = true;

      this.orderService
        .saveOrder(payload)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (resp: ApiResponse) => {
            if (resp?.codigo === '200') {
              this.cart.clear();
              this.router.navigate(['/order-confirmation'], {
                state: {
                  orderId: resp?.respuesta ?? null,
                  total: this.total,
                  shipping: this.shippingForm.value,
                  paymentMethod: this.paymentForm.get('metodo')!.value,
                },
              });
            } else {
              this.error = resp?.mensaje || 'Error en la compra';
            }
          },
          error: (err) => {
            console.error('Error al guardar compra', err);
            this.error = err?.message || 'Error de conexión al procesar la compra';
          },
        });
    });
  }
}
