import { Injectable } from '@angular/core';
import { UsersService } from "../users/users.service";
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TiendaService {
  private baseURL = 'http://localhost:4000/tienda/';

  constructor(
    private http: HttpClient,
    private usersService: UsersService,
    private route: Router
  ) {}

  // Método para obtener las skins desde el backend con opciones
  getSkinsWithOptions(opciones: any): Observable<any[]> {
    const headers = this.getHeaders();
    if (!headers) {
      return of([]);
    }

    // Realiza una solicitud POST con los parámetros de opciones en el cuerpo
    return this.http.post<any[]>(this.baseURL, opciones, { headers });
  }

  // Método para comprar una skin
  buySkin(idSkin: string): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
      return of([]);
    }

    // Realiza una solicitud POST con el id de la skin a comprar en el cuerpo
    return this.http.post<any>(`${this.baseURL}comprar`, { idSkin }, { headers });
  }

  getOwnedSkins(): Observable<any[]> {
    const headers = this.getHeaders();
    if (!headers) {
      return of([]);
    }

    return this.http.get<any[]>("http://localhost:4000/misSkins/" + '/enPropiedad', { headers });
  }

  getMoney(): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
      return of([]);
    }
    const res = this.http.get<any>(`${this.baseURL}dineroUser`, { headers });
    return res;
  }

  private getHeaders(): HttpHeaders | null {
    const token = this.usersService.getToken();
    if (!token) {
      // Redirige al usuario a la página de inicio de sesión si no hay token
      this.route.navigate(['/login']);
      return null;
    }

    // Configura los encabezados con el token de autorización
    const headers = new HttpHeaders({
      'Authorization': `${token}`
    });

    return headers;
  }
}
