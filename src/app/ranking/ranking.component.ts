import { Component } from '@angular/core';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.css'
})
export class RankingComponent {
  leaderboard = [
    { name: 'Jugador 1', points: 1500 },
    { name: 'Jugador 2', points: 1200 },
    { name: 'Jugador 3', points: 1100 }
  ];

  constructor() { }

}
