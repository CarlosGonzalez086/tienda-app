import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import {
  DtoCliente,
  RegistrationService,
  ApiResponse,
} from '../../services/RegistrationService';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent {
  registerForm: FormGroup;
  loading = false;
  serverMessage:
    | { type: 'success' | 'error' | 'info'; text: string }
    | null = null;

  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: [''],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      correo_electronico: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  submit(): void {
    this.serverMessage = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.serverMessage = {
        type: 'error',
        text: 'Corrige los errores del formulario.',
      };
      return;
    }

    const payload: DtoCliente = {
      id: 0,
      nombre: this.f['nombre'].value.errors?.['required'],
      apellidos: this.f['apellidos'].value.errors?.['required'],
      direccion: this.f['direccion'].value.errors?.['required'],
      correo_electronico: this.f['correo_electronico'].value.errors?.['required'],
      contrasena: this.f['contrasena'].value.errors?.['required'],
    };

    this.loading = true;

    this.registrationService
      .saveClient(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (resp: ApiResponse) => {
          if (resp.codigo === '200') {
            this.serverMessage = {
              type: 'success',
              text: resp.mensaje || 'Usuario registrado correctamente.',
            };
            setTimeout(() => this.router.navigate(['/login']), 1200);
          } else {
            this.serverMessage = {
              type: 'error',
              text: resp.mensaje || 'Error en el registro.',
            };
          }
        },
        error: () => {
          this.serverMessage = {
            type: 'error',
            text: 'Error de conexión al registrar.',
          };
        },
      });
  }
}
