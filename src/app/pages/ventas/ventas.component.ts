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
import { SaleService } from '../../services/venta.service';
import { SupplyService } from '../../services/insumo.service';
import { ProductService } from '../../services/producto.service';
import { ClientService } from '../../services/client.service';
import { Sale, SaleItem } from '../../models/venta.model';
import { Supply } from '../../models/insumo.model';
import { Product } from '../../models/producto.model';
import { Client } from '../../models/client.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { CopCurrencyDirective } from '../../shared/directives/cop-currency.directive';

@Component({
  selector: 'app-ventas',
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
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss'
})
export class VentasComponent implements OnInit {
  sales: Sale[] = [];
  supplies: Supply[] = [];
  products: Product[] = [];
  clients: Client[] = [];
  showForm = false;

  newSale: Sale = this.createEmptySale();
  newItemType: 'PRODUCT' | 'SUPPLY' = 'PRODUCT';
  newItemId: string | null = null;
  newItemQuantity = 1;
  newItemPrice = 0;

  constructor(
    private saleService: SaleService,
    private supplyService: SupplyService,
    private productService: ProductService,
    private clientService: ClientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.saleService.getSales().subscribe(data => this.sales = data);
    this.supplyService.getSupplies().subscribe(data => this.supplies = data);
    this.productService.getProducts().subscribe(data => this.products = data);
    this.clientService.getClients().subscribe(data => this.clients = data);
  }

  createEmptySale(): Sale {
    return {
      date: new Date(),
      clientId: '',
      clientName: '',
      items: [],
      itemsSubtotal: 0,
      transportCost: 0,
      total: 0,
      notes: ''
    };
  }

  onClientSelected(): void {
    const client = this.clients.find(c => c.id === this.newSale.clientId);
    this.newSale.clientName = client ? client.name : '';
  }

  get availableItems(): { id: string; name: string; price: number; unit: string }[] {
    if (this.newItemType === 'PRODUCT') {
      return this.products.map(p => ({ id: p.id!, name: p.name, price: p.unitCost || 0, unit: 'Unidad' }));
    }
    return this.supplies.map(s => ({ id: s.id!, name: `${s.name} (${s.purchaseUnit})`, price: s.unitCost, unit: s.purchaseUnit }));
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

    const saleItem: SaleItem = {
      itemType: this.newItemType,
      itemId: item.id!,
      itemName: item.name,
      unit: item.unit,
      quantity: this.newItemQuantity,
      unitPrice: this.newItemPrice,
      subtotal: this.newItemQuantity * this.newItemPrice
    };

    this.newSale.items = [...this.newSale.items, saleItem];
    this.recalculateTotals();
    this.newItemId = null;
    this.newItemQuantity = 1;
    this.newItemPrice = 0;
  }

  removeItem(index: number): void {
    this.newSale.items = this.newSale.items.filter((_: SaleItem, i: number) => i !== index);
    this.recalculateTotals();
  }

  recalculateTotals(): void {
    this.newSale.itemsSubtotal = this.newSale.items.reduce((s: number, i: SaleItem) => s + i.subtotal, 0);
    this.newSale.total = this.newSale.itemsSubtotal + this.newSale.transportCost;
  }

  saveSale(): void {
    if (this.newSale.items.length === 0) return;
    this.saleService.addSale({ ...this.newSale }).subscribe(() => {
      this.snackBar.open('Venta registrada', 'Cerrar', { duration: 3000 });
      this.newSale = this.createEmptySale();
      this.showForm = false;
    });
  }

  deleteSale(sale: Sale): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Eliminar Venta', message: 'Esta seguro de eliminar esta venta?' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.saleService.deleteSale(sale.id!).subscribe(() => {
          this.snackBar.open('Venta eliminada', 'Cerrar', { duration: 3000 });
        });
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.newSale = this.createEmptySale();
    }
  }
}
