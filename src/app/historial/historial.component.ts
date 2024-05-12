import { Component } from '@angular/core';
import { Partida } from '../partidas/partidas.component';
import { HistorialService  } from './historial.service';
import { NgFor } from '@angular/common';


@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.css'
})
export class HistorialComponent {
  partidas: Partida[] = [];

  constructor(private historialService: HistorialService) { }
  
  ngOnInit(): void{
    this.getHistorico();
    console.log(this.partidas)
  }
  
  getHistorico(){
    this.historialService.getHistorial().subscribe(listaPartidas => this.partidas = listaPartidas);
  }

  esGanador(jugador : string, id : string):boolean{
    let foundPartida = this.partidas.find(partida => partida._id === id);
    return foundPartida ? jugador === foundPartida.ganador : false;
  }
  getJugadores(p :Partida):string{
    var retVal:string = ""
    for (let i = 0; i < p.jugadores.length; i++) {
      retVal += p.jugadores[i].usuario;
      if (this.esGanador(p.jugadores[i].usuario,p._id)) {
        retVal+="⭐";
      }
      if (i<p.jugadores.length-1) {
        retVal+=",";
      }
      
    }
    return retVal;
  }
}
