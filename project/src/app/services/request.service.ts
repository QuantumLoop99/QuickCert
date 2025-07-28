//request.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  checkOfficerAvailability(): Observable<any> {
    return this.http.get(`${this.apiUrl}/officers/availability`, { headers: this.getHeaders() });
  }

  submitRequest(requestData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/requests`, requestData, { headers: this.getHeaders() });
  }

  getUserRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/requests/user`, { headers: this.getHeaders() });
  }

  getRequestStatus(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/requests/${id}/status`, { headers: this.getHeaders() });
  }

  getPendingRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/requests/pending`, { headers: this.getHeaders() });
  }

  reviewRequest(id: number, action: string, comments?: string, monthlyIncomeData?: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/requests/${id}/review`, {
      action,
      comments,
      monthlyIncomeData
    }, { headers: this.getHeaders() });
  }


  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/requests/${id}/document`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }


  submitFeedback(requestId: number, rating: number, comments: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/feedback`, {
      requestId,
      rating,
      comments
    }, { headers: this.getHeaders() });
  }
}