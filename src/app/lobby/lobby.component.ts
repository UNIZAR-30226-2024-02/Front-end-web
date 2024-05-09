import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, HostListener } from '@angular/core';
import { LobbyService } from './lobby.service'; 
import {Partida} from '../partidas/partidas.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChatService } from '../chat/chat.service';
import { UsersService } from '../users/users.service';
import { map, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { Chat, Mensaje } from '../chat/chat.component';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})

export class LobbyComponent implements OnInit {
  partidaId: string = '';
  partida: Partida = {} as Partida;
  chat: Chat = {} as Chat;
  myUser = this.userService.getUsername();
  users: { [key: string]: any } = {};
  nombreJugador : string = '';
  @ViewChild('chatContainer', { static: false }) private chatContainer!: ElementRef;
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event) {
    this.lobbyService.salirPartida(this.partidaId).subscribe(() => {
      this.router.navigate(['/menu']);
    });
    this.socket.emit('disconnectGame', { gameId: this.partida._id, user: this.userService.getUsername() });
    this.socket.off('chatMessage');
    this.socket.off('userJoined');
    this.socket.off('userDisconnected');
    this.socket.off('gameStarted');
    //this.socket.emit('disconnectGame', { gameId: this.partida._id, user: this.userService.getUsername() });
  }
  constructor(private router: Router, private lobbyService: LobbyService, private toastr: ToastrService, 
      private chatService: ChatService, private userService: UsersService, private socket: Socket)
    {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras.state as {partida: any};
      if (!state || !state.partida) {
        this.router.navigate(['/menu']);
      } else {
        this.partida = state.partida;
        this.chat = state.partida.chat;
        this.partidaId = this.partida._id;
        this.socket.emit('joinChat', this.chat._id);
        this.socket.emit('joinGame', { gameId: this.partida._id, user: this.userService.getUsername() });
        const userRequests = this.partida.jugadores.map((jugador: any) => 
          this.userService.getUserSkin(jugador.usuario).pipe(
            map(response => [jugador.usuario, response.path])
          )
        );
        forkJoin(userRequests).subscribe(results => {
          this.users = results.reduce((acc: any, [user, path]) => {
            acc[user] = path;
            return acc;
          }, {});
          console.log(this.users);
        });
      }
    }

  ngOnInit(): void {

    this.socket.on('chatMessage', (mensaje: string, user: string, timestamp: string, chatId: string) => {
      if (this.chat) {
         if (!this.chat.mensajes) {
           this.chat.mensajes = [];
         }
         this.chat.mensajes.push({ texto: mensaje, idUsuario: user, timestamp: timestamp });
       }
     }); 

     this.socket.on('userJoined', (user: string) => {
      console.log('userJoined', user);
      this.toastr.info(user + ' se ha unido a la partida', 'Nuevo jugador');
      this.userService.getUserSkin(user).subscribe(response => {
        this.users[user] = response.path;
        this.partida.jugadores.push({ usuario: user, territorios: [], cartas: [], abandonado: false, _id: '', skinFichas: '', color: ''});
      });
      console.log(this.users);
      });
      this.socket.on('userDisconnected', (user: string) => {
        console.log('userDisconnected', user);
        this.toastr.info(user + ' ha abandonado la partida', 'Jugador desconectado');
        delete this.users[user];
        console.log(this.users);
      });
      this.socket.on('gameStarted', (gameId: string) => {
        console.log('gameStarted', gameId);
        this.router.navigate(['/partida'], { state: { partida: this.partida } });
      });
  }

  ngAfterViewChecked() {
    this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
  }

  confirmSalirPartida() {
    if (window.confirm('¿Estás seguro de que deseas abandonar la partida?')) {
      this.salirPartida();
    }
  }

  salirPartida() {
    this.lobbyService.salirPartida(this.partidaId).subscribe(() => {
      this.socket.emit('disconnectGame', { gameId: this.partida._id, user: this.userService.getUsername() });
      this.socket.off('chatMessage');
      this.socket.off('userJoined');
      this.socket.off('userDisconnected');
      this.socket.off('gameStarted');
      this.router.navigate(['/menu']);
    });
  }

  empezarPartida() {
    console.log(this.partidaId)
    this.lobbyService.empezarPartida(this.partidaId).subscribe(
      () => {
        this.socket.emit('gameStarted', this.partida._id);
        console.log(this.partidaId)
        this.router.navigate(['/partida'], { state: { partida: this.partida } });
      },
      error => {
        this.toastr.error(error.error.error);
      }
    );
  }

  sendMessage(texto : string){
    this.chatService.enviarMensaje(this.chat._id, texto).subscribe(() => {
      this.chat.mensajes.push({texto: texto, idUsuario: this.myUser , timestamp: new Date().toISOString()});
      this.socket.emit('sendChatMessage', { chatId: this.chat._id, message: texto, user: this.myUser, timestamp: new Date().toISOString()});
    });
  }

  invitar(user : string, partida_id: string) {
    console.log(partida_id)
    this.lobbyService.invitar(user, partida_id).subscribe(
      info => {
        this.toastr.success('Invitación enviada con éxito al jugador ' + user);
        this.socket.emit('inviteGame', { gameId: partida_id, user_dest: user, user_from: this.userService.getUsername()})
      },
      error => {
        this.toastr.error('Error al enviar la invitación', error);
      }
    );
  }


  

}
