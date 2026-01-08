import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  category_id?: number;
  label: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    const apiBase = (window as any)['API_URL'] || 'http://localhost:3000';
    this.apiUrl = `${apiBase}/categories`;
    console.log('[CategoryService] Initialized with API URL:', this.apiUrl);
    console.log('[CategoryService] window.API_URL:', (window as any)['API_URL']);
  }

  getCategories(): Observable<Category[]> {
    console.log('[CategoryService] Fetching categories from:', this.apiUrl);
    return this.http.get<Category[]>(this.apiUrl);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  createCategory(category: { label: string }): Observable<Category> {
    console.log('[CategoryService] Creating category:', category);
    console.log('[CategoryService] POST URL:', this.apiUrl);
    return this.http.post<Category>(this.apiUrl, category);
  }

  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
