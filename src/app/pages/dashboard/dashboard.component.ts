import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SupplyService } from '../../services/insumo.service';
import { ProductService } from '../../services/producto.service';
import { SaleService } from '../../services/venta.service';
import { Supply } from '../../models/insumo.model';
import { Product } from '../../models/producto.model';
import { Sale } from '../../models/venta.model';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, CopCurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  supplies: Supply[] = [];
  products: Product[] = [];
  sales: Sale[] = [];

  constructor(
    private supplyService: SupplyService,
    private productService: ProductService,
    private saleService: SaleService
  ) {}

  ngOnInit(): void {
    this.supplyService.getSupplies().subscribe(data => this.supplies = data);
    this.productService.getProducts().subscribe(data => this.products = data);
    this.saleService.getSales().subscribe(data => this.sales = data);
  }

  get totalSales(): number {
    return this.sales.reduce((sum, s) => sum + s.total, 0);
  }

  get productsWithRecipe(): Product[] {
    return this.products.filter(p => p.recipe.length > 0);
  }
}
