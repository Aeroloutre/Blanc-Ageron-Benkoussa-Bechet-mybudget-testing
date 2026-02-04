import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    const apiBase = (window as any)['API_URL'] || 'http://localhost:3000';
    this.apiUrl = `${apiBase}/database`;
  }

  deleteAllData(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-data`);
  }
}