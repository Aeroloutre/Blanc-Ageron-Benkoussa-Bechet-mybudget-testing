import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Budget {
  budget_id?: number;
  category_id: number;
  category_label?: string;
  allocated_amount: number;
  period_start: string;
  period_end: string;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetStatus {
  budget_id: number;
  category: string;
  allocated_amount: number;
  period_start: string;
  period_end: string;
  spent_amount: number;
  remaining_amount: number;
  percent_used: number;
  status: 'OK' | 'WARNING' | 'OVER_BUDGET';
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    // Support for environment-based API URL configuration
    // When running with Docker: backend is accessible at localhost:3000
    const apiBase = (window as any)['API_URL'] || 'http://localhost:3000';
    this.apiUrl = `${apiBase}/budgets`;
  }

  getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.apiUrl);
  }

  getBudgetById(id: number): Observable<Budget> {
    return this.http.get<Budget>(`${this.apiUrl}/${id}`);
  }

  createBudget(budget: Budget): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, budget);
  }

  updateBudget(id: number, budget: Partial<Budget>): Observable<Budget> {
    return this.http.put<Budget>(`${this.apiUrl}/${id}`, budget);
  }

  deleteBudget(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
