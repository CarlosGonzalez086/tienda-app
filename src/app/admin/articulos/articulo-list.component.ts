import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Articulos, ArticulosService } from '../services/articulos.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-articulo-list',
  templateUrl: './articulo-list.component.html',
  styleUrls: ['./articulo-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardModule,
    RouterLink,
    RouterLinkActive
  ],
})
export class ArticuloListComponent implements OnInit {
  articulos = new MatTableDataSource<Articulos>();
  displayedColumns: string[] = [
    'id',
    'codigo',
    'descripcion',
    'precio',
    'stock',
    'acciones'
  ];

  cargando = true;
  error = false;

  constructor(
    private articulosService: ArticulosService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarArticulos();
  }

  cargarArticulos() {
    this.cargando = true;
    this.error = false;

    this.articulosService.obtenerArticulos().subscribe({
      next: (res: any) => {
        const lista: Articulos[] = Array.isArray(res) ? res : [];
        this.articulos.data = lista;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = true;
        this.articulos.data = [];
        this.cargando = false;
        this.snackBar.open(
          'Error al cargar artículos: ' + (err?.message || 'Error desconocido'),
          'Cerrar',
          { duration: 3000 }
        );
        this.cdr.detectChanges();
      },
    });
  }

  eliminarArticulo(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.articulosService.eliminarArticulo(id).subscribe({
          next: (res: any) => {
            this.snackBar.open(
              res?.mensaje || 'Artículo eliminado',
              'Cerrar',
              { duration: 3000 }
            );
            this.cargarArticulos();
          },
          error: () => {
            this.snackBar.open(
              'Error al eliminar artículo',
              'Cerrar',
              { duration: 3000 }
            );
          },
        });
      }
    });
  }
}
