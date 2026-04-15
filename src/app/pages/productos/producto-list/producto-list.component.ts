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
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services/producto.service';
import { Product } from '../../../models/producto.model';
import { ProductoFormComponent } from '../producto-form/producto-form.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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
  templateUrl: './producto-list.component.html',
  styleUrl: './producto-list.component.scss'
})
export class ProductoListComponent implements OnInit {
  products: Product[] = [];
  displayedColumns = ['name', 'type', 'dimensions', 'units', 'stock', 'unitCost', 'actions'];

  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => this.products = data);
  }

  openForm(product?: Product): void {
    const dialogRef = this.dialog.open(ProductoFormComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: product ? JSON.parse(JSON.stringify(product)) : null,
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.productService.updateProduct(result).subscribe(() => {
            this.snackBar.open('Producto actualizado', 'Cerrar', { duration: 3000 });
          });
        } else {
          this.productService.addProduct(result).subscribe(() => {
            this.snackBar.open('Producto creado', 'Cerrar', { duration: 3000 });
          });
        }
      }
    });
  }

  deleteProduct(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Producto',
        message: `Esta seguro de eliminar "${product.name}"?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.productService.deleteProduct(product.id!).subscribe(() => {
          this.snackBar.open('Producto eliminado', 'Cerrar', { duration: 3000 });
        });
      }
    });
  }
}
