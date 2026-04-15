import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductionService } from '../../services/produccion.service';
import { ProductService } from '../../services/producto.service';
import { Product } from '../../models/producto.model';
import { ProductionBatch, QualityStatus, QUALITY_STATUSES } from '../../models/lote-produccion.model';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-produccion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,
    MatChipsModule,
    MatDialogModule,
    CopCurrencyPipe,
  ],
  templateUrl: './produccion.component.html',
  styleUrl: './produccion.component.scss'
})
export class ProduccionComponent implements OnInit {
  products: Product[] = [];
  batches: ProductionBatch[] = [];
  qualityStatuses = QUALITY_STATUSES;

  showForm = false;
  selectedProductId: string | null = null;
  cementBags = 1;
  kgPerBag = 50;
  notes = '';

  displayedColumns = ['id', 'product', 'date', 'bags', 'units', 'cementKg', 'cost', 'quality', 'actions'];

  constructor(
    private productionService: ProductionService,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => this.products = data);
    this.productionService.getBatches().subscribe(data => this.batches = data);
  }

  get selectedProduct(): Product | null {
    if (!this.selectedProductId) return null;
    return this.products.find(p => p.id === this.selectedProductId) || null;
  }

  get estimatedUnits(): number {
    if (!this.selectedProduct) return 0;
    return this.cementBags * this.selectedProduct.unitsPerBatch;
  }

  get totalCementKg(): number {
    return this.cementBags * this.kgPerBag;
  }

  get estimatedCost(): number {
    if (!this.selectedProduct) return 0;
    return this.cementBags * (this.selectedProduct.productionCost || 0);
  }

  registerProduction(): void {
    if (!this.selectedProduct || this.cementBags <= 0) return;

    this.productionService.registerProduction({
      productId: this.selectedProduct.id!,
      productName: this.selectedProduct.name,
      cementBags: this.cementBags,
      unitsPerBag: this.selectedProduct.unitsPerBatch,
      kgPerBag: this.kgPerBag,
      productionCostPerBatch: this.selectedProduct.productionCost || 0,
      notes: this.notes
    }).subscribe(batch => {
      this.snackBar.open(
        `Lote #${batch.id} registrado: ${batch.unitsProduced} unidades de ${batch.productName}`,
        'Cerrar',
        { duration: 4000 }
      );
      this.resetForm();
    });
  }

  updateQuality(batch: ProductionBatch, status: QualityStatus): void {
    this.productionService.updateQuality(batch.id!, status).subscribe(() => {
      this.snackBar.open(`Lote #${batch.id} marcado como ${status}`, 'Cerrar', { duration: 3000 });
    });
  }

  deleteBatch(batch: ProductionBatch): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Lote',
        message: `¿Eliminar lote #${batch.id}? Se revertirán ${batch.unitsProduced} unidades del stock.`
      }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.productionService.deleteBatch(batch.id!).subscribe(() => {
          this.snackBar.open('Lote eliminado y stock revertido', 'Cerrar', { duration: 3000 });
        });
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (this.showForm) this.resetForm();
  }

  resetForm(): void {
    this.selectedProductId = null;
    this.cementBags = 1;
    this.kgPerBag = 50;
    this.notes = '';
  }

  getQualityColor(status: QualityStatus): string {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  }

  getQualityIcon(status: QualityStatus): string {
    switch (status) {
      case 'APPROVED': return 'check_circle';
      case 'REJECTED': return 'cancel';
      default: return 'hourglass_empty';
    }
  }
}
