import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PartidasService } from '../partidas/partidas.service'; 
import {Partida} from '../partidas/partidas.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  partidaId: string = '';
  partida: Partida = {} as Partida;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {partida: any};
    this.partida = state?.partida;
  }

  ngOnInit(): void {
    
  }
  
}
