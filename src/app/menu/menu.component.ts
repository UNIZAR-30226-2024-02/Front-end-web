import { Component } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ToastrService } from 'ngx-toastr';
import { PartidaService } from "../partida/partida.service";
import { Router } from "@angular/router";
import { ChatService } from '../chat/chat.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  constructor(private socket: Socket, 
              private toastr: ToastrService,
              public partidaService: PartidaService, 
              public router: Router, private chatService: ChatService) {
                this.num=4;
                this.nombre="";
                this.password="";
              }
  notifications: string[] = [];
  num: number;
  nombre: string;
  password: string;
  showNotif = false;

  ngOnInit(): void {
    // Notificaciones de amistad
    this.socket.off('friendRequest');
    this.socket.on('friendRequest', (notification: string) => {
      this.notifications.push('Nueva solicitud de amistad: ' + notification);
      console.log('Nueva solicitud de amistad:', notification);
      //this.toastr.info(notification, 'Nueva solicitud de amistad:');
    });
    // De nuevo mensaje en chat
    this.socket.off('chatMessage')
    this.chatService.listarChats().subscribe((chats) => {
      for(let chat of chats){
        this.socket.emit('joinChat', chat.oid);
        console.log('Joining chat:', chat.oid)
      }
    });
    this.socket.on('chatMessage', (mensaje: string, user: string, timestamp: string, chatId: string) => {
      // this.toastr.info(mensaje + user + timestamp + chatId, 'Nuevo mensaje en chat');  NO BORRAR, ES ÚTIL SI QUEREMOS MOSTRAR LAS NOTIFICACIONES ALLÁ EN CUALQUIER LUGAR
      let shortMessage = mensaje.length > 10 ? mensaje.substring(0, 10) + '...' : mensaje;
      this.notifications.push('Nuevo mensaje '+  ' de: ' + user + ' ' + shortMessage);
      console.log('Nuevo mensaje en chat:', mensaje, user, timestamp, chatId);
     });
     // Y de nueva partida
     this.socket.off('gameInvitation')
     this.socket.on('gameInvitation', (gameId: string, user_from: string) => {
      this.notifications.push('Nueva invitación a partida: ' + ' de ' + user_from);
      console.log('Nueva invitación a partida:', gameId, user_from);
      //this.toastr.info('Nueva invitación a partida: ' + gameId + ' de ' + user_from);
    });
    // TODO? QUEDA ALGUNA?
  }

  /*NuevaPartida() {
    const partida = { privacidad: true, num: this.num, nombre: this.nombre, password: this.password };
    this.partidaService.NuevaPartida(partida).subscribe(() => {
      this.router.navigateByUrl("/partida");
    });
  }*/

}