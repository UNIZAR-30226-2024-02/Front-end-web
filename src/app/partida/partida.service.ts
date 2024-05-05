import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { UsersService } from "../users/users.service";
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PartidaService {

  constructor(private http: HttpClient, private router: Router, private usersService: UsersService) { }

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

  // obtiene la partida tal cual está en la base de datos
  obtenerPartida(id: string): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
        return of(null);
    }

    return this.http.put("http://"+environment.backendUrl+":4000/partida/getPartida", {user: this.usersService.getUsername(), idPartida: id}, { headers });
  }

  ObtenerTerreno(jugador: string): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
        return of(null);
    }

    return this.http.get("http://"+environment.backendUrl+":4000/misSkins/obtenerTerreno/" + jugador, { headers });
  }

  // Cambia de fase en la partida
  SiguienteFase(idPartida: string): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
        return of(null);
    }

    return this.http.put("http://"+environment.backendUrl+":4000/partida/siguienteFase", {idPartida}, { headers });
  }

  ColocarTropas(idPartida: string, territorio: string, numTropas: number): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
        return of(null);
    }

    return this.http.put("http://"+environment.backendUrl+":4000/partida/colocarTropas", {idPartida, territorio, numTropas}, { headers });
  }

  ResolverAtaque(idPartida: string, territorioAtacante: string, territorioDefensor: string, numTropas: number): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
        return of(null);
    }

    return this.http.put("http://"+environment.backendUrl+":4000/partida/atacarTerritorio", {idPartida, territorioAtacante, territorioDefensor, numTropas}, { headers });
  }

  RealizarManiobra(idPartida: string, territorioOrigen: string, territorioDestino: string, numTropas: number): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
        return of(null);
    }

    return this.http.put("http://"+environment.backendUrl+":4000/partida/realizarManiobra", {idPartida, territorioOrigen, territorioDestino, numTropas}, { headers });
  }

  AbandonarPartida(idPartida: string): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
        return of(null);
    }

    return this.http.put("http://"+environment.backendUrl+":4000/partida/salirPartida", {idPartida}, { headers });
  }

  ObtenerSetFichas(idUsuario : string): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) {
        return of(null);
    }

    return this.http.get("http://"+environment.backendUrl+":4000/misSkins/obtenerSetFichas/" + idUsuario, { headers });
  }

}
