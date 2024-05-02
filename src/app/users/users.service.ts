import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CookieService } from "ngx-cookie-service";
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: "root",
})
export class UsersService {
  constructor(private http: HttpClient, private cookies: CookieService) {}

  login(user: any): Observable<any> {
    return this.http.post("http://localhost:4000/login", user);
  }
  register(user: any): Observable<any> {
    return this.http.post("http://localhost:4000/register", user);
  }
  setToken(token: string) {
    this.cookies.set("token", token);
  }
  getToken() {
    return this.cookies.get("token");
  }
  setUsername(username: string){
    this.cookies.set("username", username);
  }
  getUsername(){
    return this.cookies.get("username");
  }

  getUserSkin(username: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `${this.getToken()}`);
    return this.http.get(`http://localhost:4000/misSkins/obtenerAvatar/${username}`, { headers });
  }

  getUserPartidas(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `${this.getToken()}`);
    return this.http.get(`http://localhost:4000/partida/estoyEnPartida`, { headers });
  }
}