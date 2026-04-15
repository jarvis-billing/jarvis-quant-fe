import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Purchase } from '../models/purchase.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private readonly url = `${environment.apiUrl}/purchases`;
  private purchases$ = new BehaviorSubject<Purchase[]>([]);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private http: HttpClient) {}

  loadPurchases(): void {
    if (!this.isBrowser) return;
    this.http.get<Purchase[]>(this.url).subscribe(data => this.purchases$.next(data));
  }

  getPurchases(): Observable<Purchase[]> {
    this.loadPurchases();
    return this.purchases$.asObservable();
  }

  getPurchaseById(id: string): Observable<Purchase> {
    return this.http.get<Purchase>(`${this.url}/${id}`);
  }

  addPurchase(purchase: Purchase): Observable<Purchase> {
    return this.http.post<Purchase>(this.url, purchase).pipe(
      tap(() => this.loadPurchases())
    );
  }

  deletePurchase(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => this.loadPurchases())
    );
  }
}
