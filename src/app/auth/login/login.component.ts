import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      correo_electronico: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  get f() {
    return this.form.controls;
  }

  submit(): void {
    this.error = null;

    if (this.loading) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Corrige los errores del formulario';
      return;
    }

    const { correo_electronico, contrasena } = this.form.value;
    this.loading = true;

    this.authService.login(correo_electronico, contrasena).subscribe({
      next: (resp) => {
        if (resp?.codigo === '200') {
          this.router.navigate(['/home']);
        } else {
          this.error = resp?.mensaje || 'Credenciales incorrectas';
        }
      },
      error: () => {
        this.error = 'Error de conexión con el servidor';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  goRegister(): void {
    this.router.navigate(['/register']);
  }
}
