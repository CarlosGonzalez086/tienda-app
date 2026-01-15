import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from '../admin/services/token.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private tokenService: TokenService, private router: Router) {}

canActivate(): boolean {
  const token = this.tokenService.getToken();


  if (token) return true;

  if (typeof window !== 'undefined') {

    const currentUrl = this.router.url;
    if (!currentUrl.includes('/admin/login') && !currentUrl.includes('/admin/register')) {
      this.router.navigate(['/admin/login']);
    }
  }

  return false;
}
}
