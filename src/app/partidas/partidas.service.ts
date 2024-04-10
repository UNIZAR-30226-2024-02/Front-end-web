import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsersService } from "../users/users.service";
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartidasService {
  private apiUrl = 'http://localhost:4000/partidas'; 

  constructor(private http: HttpClient, private usersService: UsersService, public router: Router) { }

  private getHeaders(): HttpHeaders | null {
    const token = this.usersService.getToken();
    if (!token) {
      // redirect the user to the login page if token does not exist
      this.router.navigate(['/login']);
      return null;
    }

    // setting up headers with authorization token
    const headers = new HttpHeaders({
      'Authorization': `${token}`
    });

    return headers;
  }

  listarPartidas(): Observable<any[]> {
    const headers = this.getHeaders();
    if (!headers) {
        return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}`, { headers });
  }

  listarInvitaciones(): Observable<any[]> {
    const headers = this.getHeaders();
    if (!headers) {
        return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}/invitaciones`, { headers });
  }
  
}