import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TiendaService, Tienda } from '../services/tienda.service';
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
  selector: 'app-tienda-list',
  templateUrl: './tienda-list.component.html',
  styleUrls: ['./tienda-list.component.css'],
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
export class TiendaListComponent implements OnInit {
  tiendas = new MatTableDataSource<Tienda>();
  displayedColumns: string[] = ['id', 'sucursal', 'direccion', 'acciones'];
  cargando = true;
  error = false;

  constructor(
    private tiendaService: TiendaService,

    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarTiendas();
  }

  cargarTiendas() {
    this.cargando = true;
    this.error = false;

    this.tiendaService.obtenerTiendas().subscribe({
      next: (res: any) => {
        const lista: Tienda[] = Array.isArray(res) ? res : [];
        this.tiendas.data = lista;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = true;
        this.tiendas.data = [];
        this.cargando = false;
        this.snackBar.open(
          'Error al cargar tiendas: ' + (err.message || 'Error desconocido'),
          'Cerrar',
          { duration: 3000 }
        );
        this.cdr.detectChanges();
      },
    });
  }

  eliminarTienda(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.tiendaService.eliminarTienda(id).subscribe({
          next: (res: any) => {
            this.snackBar.open(res.mensaje || 'Tienda eliminada', 'Cerrar', { duration: 3000 });
            this.cargarTiendas();
          },
          error: () => {
            this.snackBar.open('Error al eliminar tienda', 'Cerrar', { duration: 3000 });
          },
        });
      }
    });
  }
}
