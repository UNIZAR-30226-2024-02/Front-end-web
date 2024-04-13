import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PartidaService {

  constructor(private http: HttpClient) { }
  //TODO ESTO ES FALSO NO FUNCIONA ASÍ :_:
  NuevaPartida(partida: any): Observable<any> {
    return this.http.post("http://localhost:4000/nuevaPartida", partida);
  }
}
