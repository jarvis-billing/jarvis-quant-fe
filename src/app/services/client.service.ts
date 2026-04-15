import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Client } from '../models/client.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly url = `${environment.apiUrl}/clients`;
  private clients$ = new BehaviorSubject<Client[]>([]);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private http: HttpClient) {}

  loadClients(): void {
    if (!this.isBrowser) return;
    this.http.get<Client[]>(this.url).subscribe(data => this.clients$.next(data));
  }

  getClients(): Observable<Client[]> {
    this.loadClients();
    return this.clients$.asObservable();
  }

  getClientById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.url}/${id}`);
  }

  addClient(client: Client): Observable<Client> {
    return this.http.post<Client>(this.url, client).pipe(
      tap(() => this.loadClients())
    );
  }

  updateClient(client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.url}/${client.id}`, client).pipe(
      tap(() => this.loadClients())
    );
  }

  deleteClient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => this.loadClients())
    );
  }
}
