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
export class ChatService {
  private apiUrl = 'http://localhost:4000/chats'; 

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


  crearChat(nombreChat: string, usuarios: string[]): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
        return of(null);
    }

    return this.http.post<any>(`${this.apiUrl}/crearChat`, { nombreChat, usuarios }, { headers })
        .pipe(map(response => ({ chat: response.chat, mensaje: response.message })));
  }

  salirDeChat(OID: string): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
      return of(null);
    }

    return this.http.post<any>(`${this.apiUrl}/salirDeChat`, { OID }, { headers });
  }

  enviarMensaje(OID: string, textoMensaje: string): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
      return of(null);
    }

    return this.http.post<any>(`${this.apiUrl}/enviarMensaje`, { OID, textoMensaje }, { headers });
  }

  obtenerMensajes(OIDChat: string): Observable<any[]> {
    const headers = this.getHeaders();
    if (!headers) {
      return of([]);
    }
  
    return this.http.post<any>(`${this.apiUrl}/obtenerMensajes`, { OIDChat }, { headers })
      .pipe(map(response => response.msgs));
  }

  listarChats(): Observable<any[]> {
    const headers = this.getHeaders();
    if (!headers) {
      return of([]);
    }
  
    return this.http.get<{ mensaje: string, chats: any[] }>(`${this.apiUrl}/listar`, { headers })
      .pipe(map(response => response.chats));
  }

  obtenerParticipantes(OIDChat: string): Observable<string[]> {
    const headers = this.getHeaders();
    if (!headers) {
      return of([]);
    }
  
    return this.http.post<{ mensaje: string, par: string[] }>(`${this.apiUrl}/obtenerParticipantes`, { OIDChat }, { headers })
      .pipe(map(response => response.par));
  }
}