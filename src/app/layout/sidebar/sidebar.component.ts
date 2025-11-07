import { Component, Renderer2, HostListener, Inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../services/AuthServices';
import { CartService } from '../../services/CartService';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  public user$: Observable<any>;
  public isLoggedIn$: Observable<boolean>;
  public cartCount$: Observable<number>;

  collapsed = false;
  openOnMobile = false;
  private desktopWidth = 220;
  private collapsedWidth = 64;

  private isBrowser: boolean;

  constructor(
    public auth: AuthService,
    public cart: CartService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.user$ = this.auth.user$ as Observable<any>;
    this.isLoggedIn$ = this.auth.isLoggedIn$ as Observable<boolean>;
    this.cartCount$ = this.cart.count$ as Observable<number>;

    this.isBrowser = isPlatformBrowser(this.platformId);

    this.router.events.subscribe(() => {
      if (this.openOnMobile && this.isBrowser) this.closeMobile();
    });
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.setSidebarWidth(this.desktopWidth);
    }
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
    const w = this.collapsed ? this.collapsedWidth : this.desktopWidth;
    if (this.isBrowser) this.setSidebarWidth(w);
  }

  openMobile() {
    this.openOnMobile = true;
    if (this.isBrowser) {
      const w = this.collapsed ? this.collapsedWidth : this.desktopWidth;
      this.setSidebarWidth(w);
      this.renderer.addClass(document.body, 'no-scroll');
    }
  }

  closeMobile() {
    this.openOnMobile = false;
    if (this.isBrowser) {
      this.renderer.removeClass(document.body, 'no-scroll');
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  openCart() {
    this.router.navigate(['/cart']);
  }
  openOrders() {
    this.router.navigate(['/orders']);
  }

  loginOrProfile() {
    this.auth.user$.pipe(take(1)).subscribe((u) => {
      if (u) this.router.navigate(['/profile']);
      else this.router.navigate(['/login']);
    });
  }

  doLoginDemo() {
    if (typeof (this.auth as any).loginDummy === 'function') {
      (this.auth as any).loginDummy();
    } else {
      this.router.navigate(['/login']);
    }
  }

  doLogout() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }

  private setSidebarWidth(px: number) {
    if (!this.isBrowser) return;

    this.renderer.setStyle(document.documentElement, '--sidebar-width', `${px}px`);
  }

  @HostListener('window:keydown.esc')
  onEscape() {
    if (!this.isBrowser) return;
    if (this.openOnMobile) this.closeMobile();
  }
}
