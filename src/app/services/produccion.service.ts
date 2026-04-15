import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ProductionBatch, QualityStatus } from '../models/lote-produccion.model';
import { environment } from '../../environments/environment';

export interface RegisterProductionRequest {
  productId: string;
  productName: string;
  cementBags: number;
  unitsPerBag: number;
  kgPerBag: number;
  productionCostPerBatch: number;
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  private readonly url = `${environment.apiUrl}/production-batches`;
  private batches$ = new BehaviorSubject<ProductionBatch[]>([]);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private http: HttpClient) {}

  loadBatches(): void {
    if (!this.isBrowser) return;
    this.http.get<ProductionBatch[]>(this.url).subscribe(data => this.batches$.next(data));
  }

  getBatches(): Observable<ProductionBatch[]> {
    this.loadBatches();
    return this.batches$.asObservable();
  }

  getBatchesByProduct(productId: string): Observable<ProductionBatch[]> {
    return this.http.get<ProductionBatch[]>(`${this.url}?productId=${productId}`);
  }

  registerProduction(request: RegisterProductionRequest): Observable<ProductionBatch> {
    return this.http.post<ProductionBatch>(this.url, request).pipe(
      tap(() => this.loadBatches())
    );
  }

  updateQuality(batchId: string, status: QualityStatus): Observable<ProductionBatch> {
    return this.http.patch<ProductionBatch>(`${this.url}/${batchId}/quality`, { status }).pipe(
      tap(() => this.loadBatches())
    );
  }

  deleteBatch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => this.loadBatches())
    );
  }
}
