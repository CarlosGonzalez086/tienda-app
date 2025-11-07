import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./home/articles.component').then((m) => m.ArticlesComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./carrito/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./checkout/checkout.component').then((m) => m.CheckoutComponent),
  },
  {
    path: 'order-confirmation',
    loadComponent: () => import('./confirmacion/order-confirmation.component').then((m) => m.OrderConfirmationComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/registration.component').then((m) => m.RegistrationComponent),
  },
  {
    path: 'orders',
    loadComponent: () => import('./compras/orders.component').then((m) => m.OrdersComponent),
  }
];
