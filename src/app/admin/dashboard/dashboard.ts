import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';
import { TokenService } from '../services/token.service';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatCardModule],
})
export class DashboardComponent implements OnInit {
  adminName: string = 'Administrador';

  constructor(
    private authService: AdminAuthService,
    private router: Router,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') return;

    const token = this.tokenService.getToken();

    if (!token) {

      this.router.navigate(['/admin/login']);
      return;
    }

    this.adminName = this.tokenService.getAdminName() || 'Administrador';
  }

  logout() {
    this.authService.logout();
    this.tokenService.clear();

    if (typeof window !== 'undefined') {
      this.router.navigate(['/admin/login']);
    }
  }
}
