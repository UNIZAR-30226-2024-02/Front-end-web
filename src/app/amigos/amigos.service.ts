import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { Amigo } from './amigos'
import { UsersService } from "../users/users.service";
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AmigosService {
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
  getAmigos(): Observable<string[]> {
    const headers = this.getHeaders();
    if (!headers) {
      return of([]);
    }

    return this.http.get<{ message: string, friends: string[] }>("http://localhost:4000/amistad/listarAmigos", { headers })
      .pipe(map(response => response.friends));
  }
  addAmigos(user: any): Observable<any>{
    return this.http.post("http://localhost:4000/amistad", user);
  }
  delAmigos(user: any): Observable<any>{
    return this.http.delete("http://localhost:4000/amistad", user);
  }
}
