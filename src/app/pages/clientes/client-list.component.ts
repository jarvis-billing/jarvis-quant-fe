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
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
import { ClientFormComponent } from './client-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-client-list',
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
        <h1 class="page-title mb-0">Clientes</h1>
        <button mat-raised-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> Nuevo Cliente
        </button>
      </div>

      <!-- Mobile Cards -->
      <div class="block md:hidden">
        @for (client of clients; track client.id) {
          <mat-card class="mb-3 rounded-xl">
            <mat-card-content>
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="text-base font-semibold text-gray-800 mb-1">{{ client.name }}</h3>
                  <p class="text-sm text-gray-500 mb-1">{{ client.documentType }} {{ client.documentNumber }}</p>
                  @if (client.phone) {
                    <p class="text-sm text-gray-500 mb-0">Tel: {{ client.phone }}</p>
                  }
                  @if (client.city) {
                    <p class="text-sm text-gray-500 mb-0">{{ client.city }}</p>
                  }
                </div>
                <div class="flex flex-col gap-1">
                  <button mat-icon-button color="primary" (click)="openForm(client)" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteClient(client)" matTooltip="Eliminar">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        } @empty {
          <mat-card class="text-center py-8 rounded-xl">
            <mat-icon class="text-6xl text-gray-300 mb-4">people</mat-icon>
            <p class="text-gray-500">No hay clientes registrados</p>
            <button mat-raised-button color="primary" (click)="openForm()" class="mt-4">
              <mat-icon>add</mat-icon> Crear primer cliente
            </button>
          </mat-card>
        }
      </div>

      <!-- Desktop Table -->
      <mat-card class="hidden md:block rounded-xl overflow-hidden">
        <div class="responsive-table-container">
          <table mat-table [dataSource]="clients" class="w-full">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let c">
                <span class="font-medium">{{ c.name }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="document">
              <th mat-header-cell *matHeaderCellDef>Documento</th>
              <td mat-cell *matCellDef="let c">{{ c.documentType }} {{ c.documentNumber }}</td>
            </ng-container>

            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Teléfono</th>
              <td mat-cell *matCellDef="let c">{{ c.phone }}</td>
            </ng-container>

            <ng-container matColumnDef="city">
              <th mat-header-cell *matHeaderCellDef>Ciudad</th>
              <td mat-cell *matCellDef="let c">{{ c.city }}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let c">{{ c.email }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="w-28">Acciones</th>
              <td mat-cell *matCellDef="let c">
                <button mat-icon-button color="primary" (click)="openForm(c)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteClient(c)" matTooltip="Eliminar">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        @if (clients.length === 0) {
          <div class="text-center py-12">
            <mat-icon class="text-6xl text-gray-300 mb-4">people</mat-icon>
            <p class="text-gray-500">No hay clientes registrados</p>
            <button mat-raised-button color="primary" (click)="openForm()" class="mt-4">
              <mat-icon>add</mat-icon> Crear primer cliente
            </button>
          </div>
        }
      </mat-card>
    </div>
  `
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  displayedColumns = ['name', 'document', 'phone', 'city', 'email', 'actions'];

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.clientService.getClients().subscribe(data => this.clients = data);
  }

  openForm(client?: Client): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '550px',
      maxWidth: '95vw',
      data: client ? { ...client } : null,
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.clientService.updateClient(result).subscribe(() => {
            this.snackBar.open('Cliente actualizado', 'Cerrar', { duration: 3000 });
          });
        } else {
          this.clientService.addClient(result).subscribe(() => {
            this.snackBar.open('Cliente creado', 'Cerrar', { duration: 3000 });
          });
        }
      }
    });
  }

  deleteClient(client: Client): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Eliminar Cliente', message: `¿Está seguro de eliminar "${client.name}"?` }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.clientService.deleteClient(client.id!).subscribe(() => {
          this.snackBar.open('Cliente eliminado', 'Cerrar', { duration: 3000 });
        });
      }
    });
  }
}
