import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getDistricts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/locations/districts`, { headers: this.getHeaders() });
  }

  getDSOffices(districtId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/locations/ds-offices/${districtId}`, { headers: this.getHeaders() });
  }

  getGNDivisions(dsOfficeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/locations/gn-divisions/${dsOfficeId}`, { headers: this.getHeaders() });
  }
}