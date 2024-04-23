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
export class LobbyService {
  private apiUrl = 'http://localhost:4000/'; 

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


  empezarPartida(id: string): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
        return of([]);
    }

    return this.http.put<any>(`${this.apiUrl}partida/iniciarPartida`, {idPartida: id}, { headers });
  }

  salirPartida(partidaId: string): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
        return of([]);
    }

    return this.http.post<any>(`${this.apiUrl}partidas/salirPartida`, { partidaId }, { headers });
  }

  invitar(user : string, partida_id : string) : Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
        return of([]);
    }

    return this.http.put<any>(`${this.apiUrl}nuevaPartida/invite`, {user, idPartida : partida_id}, { headers });
  }
  
  
}