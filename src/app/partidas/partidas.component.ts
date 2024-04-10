import { Component, OnInit } from '@angular/core';
import { PartidasService } from './partidas.service';
import { ToastrService } from 'ngx-toastr';
import { Socket } from 'ngx-socket-io';
import { UsersService } from '../users/users.service';

export interface Partida {
  _id: string;
  maxJugadores: number;
  nombre: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  password: string | null;
  turno: number;
  jugadores: Jugador[];
  cartas: any[];
  descartes: any[];
  mapa: any[];
  __v: number;
}

export interface Jugador {
  usuario: string;
  territorios: any[];
  cartas: any[];
  abandonado: boolean;
  _id: string;
}

@Component({
  selector: 'app-partidas',
  templateUrl: './partidas.component.html',
  styleUrl: './partidas.component.css'
})

export class PartidasComponent {
  partidas: Partida[] = [];
  invitaciones: Partida[] = [];
  
  constructor(private partidasService: PartidasService, private toastr: ToastrService,
    private socket: Socket, private usersService: UsersService) { }

  ngOnInit(): void {
    this.getPartidas();
    this.listarInvitaciones();
  }

  getPartidas(): void {
    this.partidasService.listarPartidas().subscribe(partidas => {
      this.partidas = partidas;
    });
  }

  listarInvitaciones(): void {
    this.partidasService.listarInvitaciones().subscribe(invitaciones => {
      this.invitaciones = invitaciones;
      console.log(invitaciones)
    });
  }

  crearPartida(nombre: string, password: string | null | undefined, numJugadores: number): void {
    if(password=='') password = null;
    this.partidasService.crearPartida({nombre, password, numJugadores}).subscribe(
      partida => {
        this.getPartidas();
        //TODO navigate to partida 
        this.toastr.success('Partida creada con éxito');
      },
      error => {
        this.toastr.error('Error al crear la partida');
      }
    );
  }

  unirsePartida(id: string, password: string | null): void {
    this.partidasService.unirsePartida(id, password).subscribe(
      partida => {
        this.getPartidas();
        //TODO navigate to partida 
        this.toastr.success('Unido a la partida con éxito');
      },
      error => {
        this.toastr.error('Error al unirse a la partida');
      }
    );
  }

}
