import { Component } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ToastrService } from 'ngx-toastr';
import { PartidaService } from "../partida/partida.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  constructor(private socket: Socket, 
              private toastr: ToastrService,
              public partidaService: PartidaService, 
              public router: Router) {
                this.num=4;
                this.nombre="";
                this.password="";
              }
  notifications: string[] = [];
  num: number;
  nombre: string;
  password: string;

  ngOnInit(): void {
    this.socket.off('friendRequest');
    this.socket.on('friendRequest', (notification: string) => {
      this.notifications.push(notification);
      console.log('Nueva solicitud de amistad:', notification);
      this.toastr.info(notification, 'Nueva solicitud de amistad:');
    });
  }

  NuevaPartida() {
    const partida = { privacidad: true, num: this.num, nombre: this.nombre, password: this.password };
    this.partidaService.NuevaPartida(partida).subscribe(() => {
      this.router.navigateByUrl("/partida");
    });
  }
}