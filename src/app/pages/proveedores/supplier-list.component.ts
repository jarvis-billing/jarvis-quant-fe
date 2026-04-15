import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SupplierService } from '../../services/supplier.service';
import { Supplier } from '../../models/supplier.model';
import { SupplierFormComponent } from './supplier-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  template: `
    <div class="page-container">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 class="page-title mb-0">Proveedores</h1>
        <button mat-raised-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> Nuevo Proveedor
        </button>
      </div>

      <!-- Mobile Cards -->
      <div class="block md:hidden">
        @for (supplier of suppliers; track supplier.id) {
          <mat-card class="mb-3 rounded-xl">
            <mat-card-content>
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="text-base font-semibold text-gray-800 mb-1">{{ supplier.name }}</h3>
                  <p class="text-sm text-gray-500 mb-1">{{ supplier.documentType }} {{ supplier.documentNumber }}</p>
                  @if (supplier.contactName) {
                    <p class="text-sm text-gray-500 mb-1">Contacto: {{ supplier.contactName }}</p>
                  }
                  @if (supplier.phone) {
                    <p class="text-sm text-gray-500 mb-0">Tel: {{ supplier.phone }}</p>
                  }
                </div>
                <div class="flex flex-col gap-1">
                  <button mat-icon-button color="primary" (click)="openForm(supplier)" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteSupplier(supplier)" matTooltip="Eliminar">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        } @empty {
          <mat-card class="text-center py-8 rounded-xl">
            <mat-icon class="text-6xl text-gray-300 mb-4">local_shipping</mat-icon>
            <p class="text-gray-500">No hay proveedores registrados</p>
            <button mat-raised-button color="primary" (click)="openForm()" class="mt-4">
              <mat-icon>add</mat-icon> Crear primer proveedor
            </button>
          </mat-card>
        }
      </div>

      <!-- Desktop Table -->
      <mat-card class="hidden md:block rounded-xl overflow-hidden">
        <div class="responsive-table-container">
          <table mat-table [dataSource]="suppliers" class="w-full">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let s">
                <span class="font-medium">{{ s.name }}</span>
                @if (s.contactName) {
                  <p class="text-xs text-gray-500 m-0">Contacto: {{ s.contactName }}</p>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="document">
              <th mat-header-cell *matHeaderCellDef>Documento</th>
              <td mat-cell *matCellDef="let s">{{ s.documentType }} {{ s.documentNumber }}</td>
            </ng-container>

            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Teléfono</th>
              <td mat-cell *matCellDef="let s">{{ s.phone }}</td>
            </ng-container>

            <ng-container matColumnDef="city">
              <th mat-header-cell *matHeaderCellDef>Ciudad</th>
              <td mat-cell *matCellDef="let s">{{ s.city }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="w-28">Acciones</th>
              <td mat-cell *matCellDef="let s">
                <button mat-icon-button color="primary" (click)="openForm(s)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteSupplier(s)" matTooltip="Eliminar">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        @if (suppliers.length === 0) {
          <div class="text-center py-12">
            <mat-icon class="text-6xl text-gray-300 mb-4">local_shipping</mat-icon>
            <p class="text-gray-500">No hay proveedores registrados</p>
            <button mat-raised-button color="primary" (click)="openForm()" class="mt-4">
              <mat-icon>add</mat-icon> Crear primer proveedor
            </button>
          </div>
        }
      </mat-card>
    </div>
  `
})
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = [];
  displayedColumns = ['name', 'document', 'phone', 'city', 'actions'];

  constructor(
    private supplierService: SupplierService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.supplierService.getSuppliers().subscribe(data => this.suppliers = data);
  }

  openForm(supplier?: Supplier): void {
    const dialogRef = this.dialog.open(SupplierFormComponent, {
      width: '550px',
      maxWidth: '95vw',
      data: supplier ? { ...supplier } : null,
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.supplierService.updateSupplier(result).subscribe(() => {
            this.snackBar.open('Proveedor actualizado', 'Cerrar', { duration: 3000 });
          });
        } else {
          this.supplierService.addSupplier(result).subscribe(() => {
            this.snackBar.open('Proveedor creado', 'Cerrar', { duration: 3000 });
          });
        }
      }
    });
  }

  deleteSupplier(supplier: Supplier): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Eliminar Proveedor', message: `¿Está seguro de eliminar "${supplier.name}"?` }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.supplierService.deleteSupplier(supplier.id!).subscribe(() => {
          this.snackBar.open('Proveedor eliminado', 'Cerrar', { duration: 3000 });
        });
      }
    });
  }
}
