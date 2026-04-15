import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Supply } from '../models/insumo.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupplyService {
  private readonly url = `${environment.apiUrl}/supplies`;
  private supplies$ = new BehaviorSubject<Supply[]>([]);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private http: HttpClient) {}

  loadSupplies(): void {
    if (!this.isBrowser) return;
    this.http.get<Supply[]>(this.url).subscribe(data => this.supplies$.next(data));
  }

  getSupplies(): Observable<Supply[]> {
    this.loadSupplies();
    return this.supplies$.asObservable();
  }

  getSupplyById(id: string): Observable<Supply> {
    return this.http.get<Supply>(`${this.url}/${id}`);
  }

  addSupply(supply: Supply): Observable<Supply> {
    return this.http.post<Supply>(this.url, supply).pipe(
      tap(() => this.loadSupplies())
    );
  }

  updateSupply(supply: Supply): Observable<Supply> {
    return this.http.put<Supply>(`${this.url}/${supply.id}`, supply).pipe(
      tap(() => this.loadSupplies())
    );
  }

  deleteSupply(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => this.loadSupplies())
    );
  }

  addStock(supplyId: string, purchaseQty: number): Observable<Supply> {
    return this.http.patch<Supply>(`${this.url}/${supplyId}/stock`, { quantity: purchaseQty }).pipe(
      tap(() => this.loadSupplies())
    );
  }
}
