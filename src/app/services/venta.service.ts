import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Sale } from '../models/venta.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private readonly url = `${environment.apiUrl}/sales`;
  private sales$ = new BehaviorSubject<Sale[]>([]);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private http: HttpClient) {}

  loadSales(): void {
    if (!this.isBrowser) return;
    this.http.get<Sale[]>(this.url).subscribe(data => this.sales$.next(data));
  }

  getSales(): Observable<Sale[]> {
    this.loadSales();
    return this.sales$.asObservable();
  }

  getSaleById(id: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.url}/${id}`);
  }

  addSale(sale: Sale): Observable<Sale> {
    return this.http.post<Sale>(this.url, sale).pipe(
      tap(() => this.loadSales())
    );
  }

  deleteSale(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => this.loadSales())
    );
  }
}
