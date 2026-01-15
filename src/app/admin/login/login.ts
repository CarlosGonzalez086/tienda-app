import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AdminAuthService } from '../services/admin-auth.service';

// Angular Material
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    RouterModule,
  ],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AdminAuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

ngOnInit() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) {

      this.router.navigate(['/admin/dashboard']);
    }
  }
}

  login() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res: any) => {
        const data = res.respuesta;
        if (!data?.token) {
          this.snackBar.open('No se recibió token del servidor', 'Cerrar', { duration: 3000 });
          this.loading = false;
          return;
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminName', data.nombre);
        }

        this.snackBar.open(`Bienvenido ${data.nombre}`, 'Cerrar', { duration: 3000 });
        this.router.navigate(['/admin/app']);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Email o contraseña incorrectos', 'Cerrar', { duration: 3000 });
        this.loading = false;
      },
    });
  }
}
