import { Component } from "@angular/core";
import { SidebarComponentAdmin } from "./admin/layouts/sidebar/sidebar.component";

@Component({
  selector: 'app-admin-layout',
  template: `
    <app-sidebar-admin></app-sidebar-admin>
  `,
  standalone: true,
  imports: [SidebarComponentAdmin],
})
export class AdminLayoutComponent {}
