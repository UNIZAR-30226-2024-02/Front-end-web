import { Component } from '@angular/core';
import { UsersService } from "../users/users.service";
import { Router } from "@angular/router";
import { Socket } from 'ngx-socket-io';
import { PartidasService } from "../partidas/partidas.service";
import { Partida } from '../partidas/partidas.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  id: string;
  password: string;

  constructor(public userService: UsersService, public router: Router, private socket: Socket, private partidasService: PartidasService) {
    this.id="";
    this.password="";
  }

  login() {
    const user = { id: this.id, password: this.password };
    this.userService.login(user).subscribe(data => {
      this.userService.setToken(data.token);
      this.userService.setUsername(data.idUsuario);
      this.socket.emit('login', this.id);
      this.userService.getUserPartidas().subscribe((response) => {
        console.log("Respuesta", response)
        if(response.partida){
          console.log("Esta en la partida: ", response.partida);
         // this.router.navigateByUrl("/partida/"+response.partida);
         this.partidasService.obtenerInformacion(response.partida).subscribe(
          info => {
            const p : Partida = info;
            console.log(p)
            this.socket.emit('joinGame', { gameId: response.partida, user: this.userService.getUsername() });
            this.socket.emit('joinChat', p.chat._id);
            this.router.navigate(['/partida'], { state: { partida: p } });
          },
          error => {
            console.error('Error al obtener la información de la partida', error);
          }
        );
        } else {
          console.log("No está en ninguna partida")
          this.router.navigateByUrl("/menu");
        }
      });
    });
  }

}
