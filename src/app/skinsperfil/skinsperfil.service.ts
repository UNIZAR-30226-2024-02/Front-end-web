import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { UsersService } from "../users/users.service";
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: "root",
})

export class SkinsperfilService {
  constructor(private http: HttpClient, private usersService: UsersService, private route: Router) {}
  private baseURL = 'http://'+environment.backendUrl+':4000/misSkins';
  private getHeaders(): HttpHeaders | null {
    const token = this.usersService.getToken();
    if (!token) {
      // redirect the user to the login page if token does not exist
      this.route.navigate(['/login']);
      return null;
    }

    // setting up headers with authorization token
    const headers = new HttpHeaders({
      'Authorization': `${token}`
    });

    return headers;
  }

  // method to fetch owned skins from the backend
  getOwnedSkins(): Observable<any[]> {
    const headers = this.getHeaders();
    if (!headers) {
      return of([]);
    }


    return this.http.get<any[]>(this.baseURL + '/enPropiedad', { headers });
  }

  getEquippedSkins(): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
      return of([]);
    }

    return this.http.get<any>(this.baseURL + '/equipadas', { headers });
  }



  equipSkin(idSkin: string): Observable<HttpResponse<any>> {
    const headers = this.getHeaders();
    if (!headers) {
      const emptyResponse = new HttpResponse({ body: [] });
      return of(emptyResponse);
    }

    return this.http.post<any>(this.baseURL + '/equipar', { skinAEquipar: idSkin }, { headers, observe: 'response' });
  }
}
