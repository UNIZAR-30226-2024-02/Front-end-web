import { Component } from '@angular/core';
import { PartidaService } from "../partida/partida.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  num: number;
  nombre: string;
  password: string;
  constructor(public partidaService: PartidaService, public router: Router) {
    this.num=4;
    this.nombre="";
    this.password="";
  }

  NuevaPartida() {
    const partida = { privacidad: true, num: this.num, nombre: this.nombre, password: this.password };
    this.partidaService.NuevaPartida(partida).subscribe(data => {
      this.router.navigateByUrl("/partida");
    });
  }
}
