import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MessageService } from "primeng/api";
import { Observable, of } from "rxjs";
import { Ranking } from './ranking'

@Injectable({
  providedIn: 'root'
})
export const R: Ranking[] = [
  {idUsuario: "12", elo: "300"}
];

export class RankingService {
  constructor(private http: HttpClient, private messageService: MessageService) { }
  getRanking(): Observable<Ranking[]>{
    return this.http.get<Ranking[]>("https://localhost:4000/ranking")
  }

}
