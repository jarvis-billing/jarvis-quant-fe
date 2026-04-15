import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Product } from '../models/producto.model';
import { RecipeItem } from '../models/receta.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly url = `${environment.apiUrl}/products`;
  private products$ = new BehaviorSubject<Product[]>([]);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private http: HttpClient) {}

  loadProducts(): void {
    if (!this.isBrowser) return;
    this.http.get<Product[]>(this.url).subscribe(data => this.products$.next(data));
  }

  getProducts(): Observable<Product[]> {
    this.loadProducts();
    return this.products$.asObservable();
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.url}/${id}`);
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.url, product).pipe(
      tap(() => this.loadProducts())
    );
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.url}/${product.id}`, product).pipe(
      tap(() => this.loadProducts())
    );
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => this.loadProducts())
    );
  }

  addStock(productId: string, quantity: number): Observable<Product> {
    return this.http.patch<Product>(`${this.url}/${productId}/stock`, { quantity }).pipe(
      tap(() => this.loadProducts())
    );
  }

  saveRecipe(productId: string, recipe: RecipeItem[]): Observable<Product> {
    return this.http.put<Product>(`${this.url}/${productId}/recipe`, recipe).pipe(
      tap(() => this.loadProducts())
    );
  }

  calculateCosts(product: Product): void {
    let total = 0;
    for (const item of product.recipe) {
      item.totalCost = item.quantity * item.supply.recipeCost;
      total += item.totalCost;
    }
    product.productionCost = total;
    product.unitCost = product.unitsPerBatch > 0
      ? total / product.unitsPerBatch
      : 0;
  }
}
