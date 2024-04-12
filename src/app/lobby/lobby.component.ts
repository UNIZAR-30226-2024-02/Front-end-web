import { Component, OnInit } from '@angular/core';
import { LobbyService } from './lobby.service'; 
import {Partida} from '../partidas/partidas.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

export interface Chat {
  nombreChat : string;
  usuarios: string[];
  _id : string;
  mensajes : Mensaje[];
}

export interface Mensaje{
  texto: string;
  idUsuario: string;
  timestamp: string;
}

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})

export class LobbyComponent implements OnInit {
  partidaId: string = '';
  partida: Partida = {} as Partida;
  chat: Chat = {} as Chat;

  constructor(private router: Router, private lobbyService: LobbyService, private toastr: ToastrService) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {partida: any};
    if (!state || !state.partida) {
      this.router.navigate(['/menu']);
    } else {
      this.partida = state.partida;
      this.chat = state.partida.chat;
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
