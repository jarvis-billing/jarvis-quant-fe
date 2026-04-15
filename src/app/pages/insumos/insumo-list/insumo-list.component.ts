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
import { SupplyService } from '../../../services/insumo.service';
import { Supply } from '../../../models/insumo.model';
import { InsumoFormComponent } from '../insumo-form/insumo-form.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';

@Component({
  selector: 'app-insumo-list',
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
    CopCurrencyPipe,
  ],
  templateUrl: './insumo-list.component.html',
  styleUrl: './insumo-list.component.scss'
})
export class InsumoListComponent implements OnInit {
  supplies: Supply[] = [];
  displayedColumns = ['name', 'category', 'units', 'unitCost', 'actions'];

  constructor(
    private supplyService: SupplyService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.supplyService.getSupplies().subscribe(data => this.supplies = data);
  }

  openForm(supply?: Supply): void {
    const dialogRef = this.dialog.open(InsumoFormComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: supply ? { ...supply } : null,
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.supplyService.updateSupply(result).subscribe(() => {
            this.snackBar.open('Insumo actualizado', 'Cerrar', { duration: 3000 });
          });
        } else {
          this.supplyService.addSupply(result).subscribe(() => {
            this.snackBar.open('Insumo creado', 'Cerrar', { duration: 3000 });
          });
        }
      }
    });
  }

  deleteSupply(supply: Supply): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Insumo',
        message: `¿Está seguro de eliminar "${supply.name}"?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.supplyService.deleteSupply(supply.id!).subscribe(() => {
          this.snackBar.open('Insumo eliminado', 'Cerrar', { duration: 3000 });
        });
      }
    });
  }
}
