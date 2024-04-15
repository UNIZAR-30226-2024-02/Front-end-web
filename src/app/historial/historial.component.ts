import { Component } from '@angular/core';
import { Partida } from '../partidas/partidas.component';
import { HistorialService  } from './historial.service';


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

  esGanador(jugador : string, id : string){
    let foundPartida = this.partidas.find(partida => partida._id === id);
    return foundPartida ? jugador === foundPartida.ganador : false;
  }
}
