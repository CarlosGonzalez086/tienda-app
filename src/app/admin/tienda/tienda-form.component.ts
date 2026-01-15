import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TiendaService, Tienda } from '../services/tienda.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

// Angular Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tienda-form',
  templateUrl: './tienda-form.component.html',
  styleUrls: ['./tienda-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    ReactiveFormsModule,
    MatIcon,
  ],
})
export class TiendaFormComponent implements OnInit {
  form!: FormGroup;
  tiendaId?: number;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private tiendaService: TiendaService,
    private route: ActivatedRoute,
    public router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      sucursal: ['', Validators.required],
      direccion: ['', Validators.required],
    });

    this.tiendaId = this.route.snapshot.params['id'];
    if (this.tiendaId) {
      this.cargarTienda(this.tiendaId);
    }
  }

  cargarTienda(id: number) {
    this.cargando = true;
    this.tiendaService.obtenerTienda(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.snackBar.open('Error al cargar la tienda', 'Cerrar', { duration: 3000 });
      },
    });
  }

  guardar() {
    if (this.form.invalid) return;

    const tiendaData: Tienda = { id: this.tiendaId || 0, ...this.form.value };

    const peticion = this.tiendaId
      ? this.tiendaService.actualizarTienda(tiendaData)
      : this.tiendaService.guardarTienda(tiendaData);

    peticion.subscribe({
      next: (res) => {
        this.snackBar.open(res.mensaje, 'Cerrar', { duration: 3000 });
        this.router.navigate(['/admin/tienda']);
      },
      error: () => {
        this.snackBar.open('Ocurrió un error', 'Cerrar', { duration: 3000 });
      },
    });
  }
}
