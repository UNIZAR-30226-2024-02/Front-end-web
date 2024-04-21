import { Component, OnInit } from '@angular/core';
import { ChatService } from './chat.service';
import { ToastrService } from 'ngx-toastr';
import e from 'express';
import { Socket } from 'ngx-socket-io';
import { UsersService } from '../users/users.service';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';


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
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit {
  chats: Chat[] = [];
  newMessage: string = '';
  nombreChat: string = ''; 
  usuarios: string[] = [];
  nuevoUsuario: string = '';
  selectedChats: Chat[] = [];
  myName: string = '';

  constructor(private chatService: ChatService, private toastr: ToastrService,
              private socket: Socket, private usersService: UsersService) { }

fetchNewMessages(chat: Chat) {
    this.chatService.obtenerMensajes(chat._id).subscribe(messages => {
        // Asegúrate de actualizar solo si hay nuevos mensajes
        if (!chat.mensajes || messages.length !== chat.mensajes.length) {
            chat.mensajes = messages;
        }
    });
}


ngOnInit(): void {
      this.myName = this.usersService.getUsername();
      this.getChats();
      this.setupMessagePolling();
  }
  
setupMessagePolling() {
      interval(1000).pipe(
          switchMap(() => this.selectedChats.map(chat => this.fetchNewMessages(chat)))
      ).subscribe();
  }
          

  getChats(): void {
      this.chatService.listarChats().subscribe(chats => {
      console.log(chats);
      this.chats = chats.map(chat => {
        return {
          _id: chat.oid,
          nombreChat: chat.nombre,
          mensajes: [],
          usuarios: []
        };
      });
    });
  }

  sendMessage(chat : Chat, message : string): void {
    if (!message.trim()) {
      return;
    }
    this.chatService.enviarMensaje(chat._id, message).subscribe(response => {
      // handle response
      this.newMessage = '';
      this.chatService.obtenerMensajes(chat._id).subscribe(messages => {
        chat.mensajes = messages;
      });
      this.socket.emit('sendChatMessage', { chatId: chat._id, message: message, user: this.myName, timestamp: new Date().toISOString()});
    });
  }

  crearChat(nombreChat: string, usuarios: string[]): void {
      this.chatService.crearChat(nombreChat, usuarios).subscribe(
          response => {
              const newChat: Chat = {
                  nombreChat: response.chat.nombreChat,
                  _id: response.chat._id,
                  usuarios: response.chat.usuarios, 
                  mensajes: []
              };
              this.chats.push(newChat);
              this.usuarios = [];
              this.toastr.success('¡Chat creado con éxito!');
              if(response.mensaje != "OK")
                this.toastr.warning(response.mensaje);
          },
          error => {
              this.toastr.error('Error al crear el chat:', error.error.message || 'Intente de nuevo más tarde');
          }
      );
  }

  addUser(usuario: string): void {
    if (usuario && !this.usuarios.includes(usuario)) {
        this.usuarios.push(usuario);
        this.nuevoUsuario = '';
    }
  }

  exitChat(OID: string) : void {
    this.chatService.salirDeChat(OID).subscribe(
        response => {
            this.toastr.success('Has salido del chat con éxito');
            this.getChats();
        },
        error => {
            this.toastr.error('Error al salir del chat, intente de nuevo más tarde');
        }
    );
  }

  toggleChatSelection(chat: Chat): void {
    const index = this.selectedChats.findIndex(selectedChat => selectedChat._id === chat._id);

    if (index === -1) {
      // The chat is not currently selected, so add it to the array
      this.chatService.obtenerMensajes(chat._id).subscribe(messages => {
        chat.mensajes = messages;
      });
      this.chatService.obtenerParticipantes(chat._id).subscribe(participants => {
        chat.usuarios = participants;
      });
      this.selectedChats.push(chat);
      this.socket.emit('joinChat', chat._id); // cada vez que abro el chat me uno a él
      console.log(this.selectedChats);
    } else {
        // The chat is currently selected, so remove it from the array
        this.socket.emit('exitChat', chat._id); // cada vez que cierro el chat me salgo de él
        this.selectedChats.splice(index, 1);
    }
  }


}