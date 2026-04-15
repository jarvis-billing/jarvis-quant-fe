import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isMobile = false;
  sidenavOpened = true;

  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Insumos', icon: 'inventory_2', route: '/insumos' },
    { label: 'Productos', icon: 'view_in_ar', route: '/productos' },
    { label: 'Recetas y Costos', icon: 'menu_book', route: '/costos' },
    { label: 'Producción', icon: 'precision_manufacturing', route: '/produccion' },
    { label: 'Proveedores', icon: 'local_shipping', route: '/proveedores' },
    { label: 'Compras', icon: 'shopping_cart', route: '/compras' },
    { label: 'Clientes', icon: 'people', route: '/clientes' },
    { label: 'Ventas', icon: 'point_of_sale', route: '/ventas' },
  ];

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .subscribe(result => {
        this.isMobile = result.matches;
        this.sidenavOpened = !this.isMobile;
      });
  }

  toggleSidenav(): void {
    if (this.isMobile) {
      this.sidenav.toggle();
    } else {
      this.sidenavOpened = !this.sidenavOpened;
    }
  }

  closeSidenavIfMobile(): void {
    if (this.isMobile) {
      this.sidenav.close();
    }
  }
}
