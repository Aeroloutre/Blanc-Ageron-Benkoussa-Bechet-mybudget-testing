import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transaction {
  transaction_id?: number;
  amount: number;
  label?: string;
  type: 'income' | 'expense';
  transaction_date: string;
  category_id?: number;
  category_label?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionFilters {
  date_after?: string;
  date_before?: string;
  category_id?: number;
  type?: 'income' | 'expense';
  limit?: number;
  offset?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    // Support for environment-based API URL configuration
    // When running with Docker: backend is accessible at localhost:3000
    const apiBase = (window as any)['API_URL'] || 'http://localhost:3000';
    this.apiUrl = `${apiBase}/transactions`;
  }

  getTransactions(filters?: TransactionFilters): Observable<Transaction[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.date_after) params = params.set('date_after', filters.date_after);
      if (filters.date_before) params = params.set('date_before', filters.date_before);
      if (filters.category_id) params = params.set('category_id', filters.category_id.toString());
      if (filters.type) params = params.set('type', filters.type);
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.offset) params = params.set('offset', filters.offset.toString());
    }

    return this.http.get<Transaction[]>(this.apiUrl, { params });
  }

  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  createTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaction);
  }

  updateTransaction(id: number, transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transaction);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
