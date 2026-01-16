import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { LoginComponent } from './login/login';
import { RegisterAdminComponent } from './register-admin/register-admin';
import { DashboardComponent } from './dashboard/dashboard';
import { AdminLayoutComponent } from '../admin-layout.component';
import { TiendaListComponent } from './tienda/tienda-list.component';
import { TiendaFormComponent } from './tienda/tienda-form.component';
import { ArticuloListComponent } from './articulos/articulo-list.component';
import { ArticuloFormComponent } from './articulos/articulo-form.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterAdminComponent },

  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'tienda', component: TiendaListComponent },
      { path: 'tienda/form', component: TiendaFormComponent },
      { path: 'tienda/form/:id', component: TiendaFormComponent },
      { path: 'articulos', component: ArticuloListComponent },
      { path: 'articulos/form', component: ArticuloFormComponent },
      { path: 'articulos/form/:id', component: ArticuloFormComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
