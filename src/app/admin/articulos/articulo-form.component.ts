import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { Articulos, ArticulosService } from '../services/articulos.service';

@Component({
  selector: 'app-articulo-form',
  standalone: true,
  templateUrl: './articulo-form.component.html',
  styleUrls: ['./articulo-form.component.css'],
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
export class ArticuloFormComponent implements OnInit {
  form!: FormGroup;
  articuloId?: number;
  cargando = false;
  nombreImagen = '';
  previewImagen: string | null = null;

  constructor(
    private fb: FormBuilder,
    private articulosService: ArticulosService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      codigo: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: ['', Validators.required],
      imagen: [''],
      stock: ['', Validators.required],
    });

    this.articuloId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.articuloId) {
      this.cargarArticulo(this.articuloId);
    }
  }

  cargarArticulo(id: number) {
    this.cargando = true;
    this.articulosService.obtenerArticulo(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.snackBar.open('Error al cargar el artículo', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.nombreImagen = file.name;

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      this.form.patchValue({
        imagen: base64,
      });

      this.previewImagen = base64;
    };

    reader.readAsDataURL(file);
  }

  cancelar() {
    this.router.navigate(['/admin/articulos']);
  }

  guardar() {
    if (this.form.invalid) return;

    const data: Articulos = {
      id: this.articuloId ?? 0,
      ...this.form.value,
    };

    const request = this.articuloId
      ? this.articulosService.actualizarArticulo(data)
      : this.articulosService.guardarArticulo(data);

    request.subscribe({
      next: (res) => {
        this.snackBar.open(res.mensaje, 'Cerrar', { duration: 3000 });
        this.router.navigate(['/admin/articulos']);
      },
      error: () => {
        this.snackBar.open('Ocurrió un error', 'Cerrar', { duration: 3000 });
      },
    });
  }
}
