import { Component, OnInit } from '@angular/core';
import { LobbyService } from './lobby.service'; 
import {Partida} from '../partidas/partidas.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  partidaId: string = '';
  partida: Partida = {} as Partida;

  constructor(private router: Router, private lobbyService: LobbyService, private toastr: ToastrService) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {partida: any};
    if (!state || !state.partida) {
      this.router.navigate(['/menu']);
    } else {
      this.partida = state.partida;
    }
  }

  ngOnInit(): void {
    
  }

  //TODO HACERLA FUNCIONAL
  salirPartida() {
    this.lobbyService.salirPartida(this.partidaId).subscribe(() => {
      this.router.navigate(['/menu']);
      this.toastr.success('Has salido de la partida');
    });
    this.router.navigate(['/menu']);
    this.toastr.success('Has salido de la partida');
  }

  //TODO HACERLA FUNCIONAL
  empezarPartida() {
    this.lobbyService.empezarPartida(this.partidaId).subscribe(() => {
      //this.router.navigate(['/partida']);
      this.toastr.success('Imagina que la partida ha comenzado');
    });
    this.toastr.success('Imagina que la partida ha comenzado');
  }

}
