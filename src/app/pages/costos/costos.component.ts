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
import { ProductService } from '../../services/producto.service';
import { SupplyService } from '../../services/insumo.service';
import { Product } from '../../models/producto.model';
import { Supply } from '../../models/insumo.model';
import { RecipeItem } from '../../models/receta.model';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';

@Component({
  selector: 'app-costos',
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
    CopCurrencyPipe,
  ],
  templateUrl: './costos.component.html',
  styleUrl: './costos.component.scss'
})
export class CostosComponent implements OnInit {
  products: Product[] = [];
  supplies: Supply[] = [];
  selectedProduct: Product | null = null;
  displayedColumns = ['supply', 'quantity', 'recipeCost', 'totalCost', 'actions'];

  newSupplyId: string | null = null;
  newQuantity: number = 1;

  constructor(
    private productService: ProductService,
    private supplyService: SupplyService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => this.products = data);
    this.supplyService.getSupplies().subscribe(data => this.supplies = data);
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
  }

  get availableSupplies(): Supply[] {
    if (!this.selectedProduct) return this.supplies;
    const usedIds = this.selectedProduct.recipe.map((r: RecipeItem) => r.supply.id);
    return this.supplies.filter(s => !usedIds.includes(s.id));
  }

  onSupplySelected(): void {
    const supply = this.supplies.find(s => s.id === this.newSupplyId);
    if (supply) {
      this.newQuantity = supply.conversionFactor;
    }
  }

  addSupply(): void {
    if (!this.selectedProduct || !this.newSupplyId || this.newQuantity <= 0) return;

    const supply = this.supplies.find(s => s.id === this.newSupplyId);
    if (!supply) return;

    const recipeItem: RecipeItem = {
      supply: supply,
      quantity: this.newQuantity,
      totalCost: this.newQuantity * supply.recipeCost
    };

    this.selectedProduct.recipe = [...this.selectedProduct.recipe, recipeItem];
    this.recalculate();
    this.newSupplyId = null;
    this.newQuantity = 1;
  }

  removeSupply(index: number): void {
    if (!this.selectedProduct) return;
    this.selectedProduct.recipe = this.selectedProduct.recipe.filter((_: RecipeItem, i: number) => i !== index);
    this.recalculate();
  }

  updateQuantity(item: RecipeItem): void {
    item.totalCost = item.quantity * item.supply.recipeCost;
    this.recalculate();
  }

  recalculate(): void {
    if (!this.selectedProduct) return;
    this.productService.calculateCosts(this.selectedProduct);
  }

  saveRecipe(): void {
    if (!this.selectedProduct) return;
    this.productService.saveRecipe(this.selectedProduct.id!, this.selectedProduct.recipe).subscribe(() => {
      this.snackBar.open('Receta guardada correctamente', 'Cerrar', { duration: 3000 });
    });
  }
}
