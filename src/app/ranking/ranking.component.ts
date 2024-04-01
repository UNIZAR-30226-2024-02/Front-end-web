import { Component, OnInit } from '@angular/core';
import { RankingService } from './ranking.service';
import { Ranking } from './ranking'
import { NgFor } from '@angular/common';
import { UsersService } from "../users/users.service";
import { Router } from "@angular/router";
@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.css'
})
export class RankingComponent {
  leaderboard: Ranking[] = [];
  ngOnInit(): void{
    this.getRanking();
  }
  constructor(private rankingService: RankingService) { }
  getRanking(){
    this.rankingService.getRanking().subscribe(ranking => this.leaderboard = ranking);
  }

}
