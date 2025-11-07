import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/AuthServices';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  form: FormGroup;

  loading = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      correo_electronico: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  submit() {
    this.error = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { correo_electronico, contrasena } = this.form.value;
    this.loading = true;

    this.auth
      .login(correo_electronico!, contrasena!)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (resp: any) => {
          if (resp?.codigo === '200') {
            this.router.navigate(['/home']);
          } else {
            this.error = resp?.mensaje || 'Credenciales incorrectas';
          }
        },
        error: (err) => {
          console.error('Login error', err);
          this.error = err?.message || 'Error de conexión';
        },
      });
  }

  goRegister() {
    this.router.navigate(['/register']);
  }
}
