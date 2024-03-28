import { Component } from '@angular/core';
import { RankingService } from './ranking.service';
import { Ranking } from './ranking'

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.css'
})
export class RankingComponent {
  leaderboard: Ranking[] = [];
  constructor(private rankingService: RankingService) { }
  getRanking(){
    this.rankingService.getRanking().subscribe(ranking => this.leaderboard = ranking);
  }

}
