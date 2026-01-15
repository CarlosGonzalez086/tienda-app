import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { LoginComponent } from './login/login';
import { RegisterAdminComponent } from './register-admin/register-admin';
import { DashboardComponent } from './dashboard/dashboard';
import { AdminLayoutComponent } from '../admin-layout.component';
import { TiendaListComponent } from './tienda/tienda-list.component';
import { TiendaFormComponent } from './tienda/tienda-form.component';

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
    ],
  },

  { path: '**', redirectTo: 'login' }, // SIN /
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
