import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PurchaseService } from '../../services/purchase.service';
import { SupplierService } from '../../services/supplier.service';
import { SupplyService } from '../../services/insumo.service';
import { ProductService } from '../../services/producto.service';
import { Purchase, PurchaseItem } from '../../models/purchase.model';
import { Supplier } from '../../models/supplier.model';
import { Supply } from '../../models/insumo.model';
import { Product } from '../../models/producto.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { CopCurrencyDirective } from '../../shared/directives/cop-currency.directive';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,
    CopCurrencyPipe,
    CopCurrencyDirective,
  ],
  templateUrl: './compras.component.html',
  styleUrl: './compras.component.scss'
})
export class ComprasComponent implements OnInit {
  purchases: Purchase[] = [];
  suppliers: Supplier[] = [];
  supplies: Supply[] = [];
  products: Product[] = [];
  showForm = false;

  newPurchase: Purchase = this.createEmpty();
  newItemType: 'SUPPLY' | 'PRODUCT' = 'SUPPLY';
  newItemId: string | null = null;
  newItemQuantity = 1;
  newItemPrice = 0;

  constructor(
    private purchaseService: PurchaseService,
    private supplierService: SupplierService,
    private supplyService: SupplyService,
    private productService: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.purchaseService.getPurchases().subscribe(data => this.purchases = data);
    this.supplierService.getSuppliers().subscribe(data => this.suppliers = data);
    this.supplyService.getSupplies().subscribe(data => this.supplies = data);
    this.productService.getProducts().subscribe(data => this.products = data);
  }

  createEmpty(): Purchase {
    return {
      date: new Date(),
      supplierId: '',
      supplierName: '',
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      notes: ''
    };
  }

  onSupplierSelected(): void {
    const supplier = this.suppliers.find(s => s.id === this.newPurchase.supplierId);
    this.newPurchase.supplierName = supplier ? supplier.name : '';
  }

  get availableItems(): { id: string; name: string; price: number; unit: string }[] {
    if (this.newItemType === 'SUPPLY') {
      return this.supplies.map(s => ({ id: s.id!, name: `${s.name} (${s.purchaseUnit})`, price: s.unitCost, unit: s.purchaseUnit }));
    }
    return this.products.map(p => ({ id: p.id!, name: p.name, price: p.unitCost || 0, unit: 'Unidad' }));
  }

  onItemSelected(): void {
    const item = this.availableItems.find(i => i.id === this.newItemId);
    if (item) {
      this.newItemPrice = item.price;
    }
  }

  addItem(): void {
    if (!this.newItemId || this.newItemQuantity <= 0) return;
    const item = this.availableItems.find(i => i.id === this.newItemId);
    if (!item) return;

    const purchaseItem: PurchaseItem = {
      itemType: this.newItemType,
      itemId: item.id!,
      itemName: item.name,
      unit: item.unit,
      quantity: this.newItemQuantity,
      unitPrice: this.newItemPrice,
      subtotal: this.newItemQuantity * this.newItemPrice
    };

    this.newPurchase.items = [...this.newPurchase.items, purchaseItem];
    this.recalculateTotals();
    this.newItemId = null;
    this.newItemQuantity = 1;
    this.newItemPrice = 0;
  }

  removeItem(index: number): void {
    this.newPurchase.items = this.newPurchase.items.filter((_: PurchaseItem, i: number) => i !== index);
    this.recalculateTotals();
  }

  recalculateTotals(): void {
    this.newPurchase.subtotal = this.newPurchase.items.reduce((s: number, i: PurchaseItem) => s + i.subtotal, 0);
    this.newPurchase.total = this.newPurchase.subtotal + this.newPurchase.tax;
  }

  savePurchase(): void {
    if (this.newPurchase.items.length === 0) return;
    this.purchaseService.addPurchase({ ...this.newPurchase }).subscribe(() => {
      this.snackBar.open('Compra registrada', 'Cerrar', { duration: 3000 });
      this.newPurchase = this.createEmpty();
      this.showForm = false;
    });
  }

  deletePurchase(purchase: Purchase): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Eliminar Compra', message: '¿Está seguro de eliminar esta compra?' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.purchaseService.deletePurchase(purchase.id!).subscribe(() => {
          this.snackBar.open('Compra eliminada', 'Cerrar', { duration: 3000 });
        });
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.newPurchase = this.createEmpty();
    }
  }
}
