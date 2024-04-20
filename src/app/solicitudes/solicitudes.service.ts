import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { UsersService } from "../users/users.service";
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {

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
  addAmigos(user: any): Observable<any>{
    const headers = this.getHeaders();
    if (!headers) {
      return of([]);
    }
    return this.http.post("http://localhost:4000/amistad", user, { headers });
  }
  getSol(): Observable<string[]> {
    const headers = this.getHeaders();
    if (!headers) {
      return of([]);
    }

    return this.http.get<{ message: string, solicitudes: string[] }>("http://localhost:4000/amistad/listarSolicitudes", { headers })
      .pipe(map(response => response.solicitudes));
  }

}
