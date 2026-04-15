import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'insumos',
        loadComponent: () => import('./pages/insumos/insumo-list/insumo-list.component').then(m => m.InsumoListComponent)
      },
      {
        path: 'productos',
        loadComponent: () => import('./pages/productos/producto-list/producto-list.component').then(m => m.ProductoListComponent)
      },
      {
        path: 'costos',
        loadComponent: () => import('./pages/costos/costos.component').then(m => m.CostosComponent)
      },
      {
        path: 'produccion',
        loadComponent: () => import('./pages/produccion/produccion.component').then(m => m.ProduccionComponent)
      },
      {
        path: 'ventas',
        loadComponent: () => import('./pages/ventas/ventas.component').then(m => m.VentasComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./pages/clientes/client-list.component').then(m => m.ClientListComponent)
      },
      {
        path: 'proveedores',
        loadComponent: () => import('./pages/proveedores/supplier-list.component').then(m => m.SupplierListComponent)
      },
      {
        path: 'compras',
        loadComponent: () => import('./pages/compras/compras.component').then(m => m.ComprasComponent)
      },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
