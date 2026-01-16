import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-sidebar *ngIf="showSidebar"></app-sidebar>
      <main class="main-content" [class.full-width]="!showSidebar">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
})
export class AppComponent {
  showSidebar = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const sidebarRoutes = ['/home', '/cart', '/orders','/checkout','/order-confirmation'];
        this.showSidebar = sidebarRoutes.some((route) =>
          event.urlAfterRedirects.startsWith(route)
        );
      });
  }
}
