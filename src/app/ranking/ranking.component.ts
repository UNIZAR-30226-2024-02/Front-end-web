import { Component, OnInit } from '@angular/core';
import { RankingService } from './ranking.service';
import { Ranking } from './ranking'
import { UsersService } from '../users/users.service';
@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.css'
})
export class RankingComponent {
  leaderboard: Ranking[] = [];
  miElo: any;
  ngOnInit(): void{
    this.getRanking();
  }
  constructor(private rankingService: RankingService, private usersService: UsersService) {
    this.miElo = "a";
  }
  getRanking(){
    this.rankingService.getRanking().subscribe(ranking => this.leaderboard = ranking);
  }

  getElo(): any{
  return this.leaderboard.find( x => x.idUsuario == this.usersService.getUsername())?.elo
  }
}
