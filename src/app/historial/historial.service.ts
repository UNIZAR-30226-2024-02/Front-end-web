import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { UsersService } from "../users/users.service";
import { Router } from '@angular/router';
import {environment} from '../../environment/environment';

@Injectable({  providedIn: 'root'})


export class HistorialService {
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
  getHistorial(): Observable<any[]>{
    const headers = this.getHeaders();
    if (!headers) {
      return of([]);
    }
    return this.http.get<any[]>("http://" + environment.backendUrl + ":4000/partidas/historico", { headers })
  }

}
