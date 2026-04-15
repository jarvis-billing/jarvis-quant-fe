import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Supplier } from '../models/supplier.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private readonly url = `${environment.apiUrl}/suppliers`;
  private suppliers$ = new BehaviorSubject<Supplier[]>([]);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private http: HttpClient) {}

  loadSuppliers(): void {
    if (!this.isBrowser) return;
    this.http.get<Supplier[]>(this.url).subscribe(data => this.suppliers$.next(data));
  }

  getSuppliers(): Observable<Supplier[]> {
    this.loadSuppliers();
    return this.suppliers$.asObservable();
  }

  getSupplierById(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.url}/${id}`);
  }

  addSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.url, supplier).pipe(
      tap(() => this.loadSuppliers())
    );
  }

  updateSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.url}/${supplier.id}`, supplier).pipe(
      tap(() => this.loadSuppliers())
    );
  }

  deleteSupplier(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => this.loadSuppliers())
    );
  }
}
