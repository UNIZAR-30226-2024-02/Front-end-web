import { Component, OnInit } from '@angular/core';
import { ChatService } from './chat.service';
import { ToastrService } from 'ngx-toastr';
import e from 'express';
import { Socket } from 'ngx-socket-io';
import { UsersService } from '../users/users.service';

export interface Chat {
  nombre: string;
  oid: string;
  participants?: string[];
  messages?: Message[];
}

export interface Message {
  texto: string;
  idUsuario: string;
  timestamp: string;
  _id: string;
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

  ngOnInit(): void {
    this.myName = this.usersService.getUsername();
    this.getChats();
      this.socket.on('chatMessage', (mensaje: string, user: string, timestamp: string, chatId: string) => {
       // this.toastr.info(mensaje + user + timestamp + chatId, 'Nuevo mensaje en chat');  NO BORRAR, ES ÚTIL SI QUEREMOS MOSTRAR LAS NOTIFICACIONES ALLÁ EN CUALQUIER LUGAR
       const chat = this.selectedChats.find(chat => chat.oid === chatId);
       if (chat) {
          if (!chat.messages) {
            chat.messages = [];
          }
          chat.messages.push({ texto: mensaje, idUsuario: user, timestamp: timestamp, _id: '' });
        }
      }); 
  }

  getChats(): void {
    this.chatService.listarChats().subscribe(chats => {
      this.chats = chats;
    });
  }

  sendMessage(chat : Chat, message : string): void {
    if (message) {
      
    }
    else{
      this.toastr.error("No se pueden enviar mensajes vacíos");
    }
    if (!message.trim()) {
      return;
    }
    this.chatService.enviarMensaje(chat.oid, message).subscribe(response => {
      // handle response
      this.newMessage = '';
      this.chatService.obtenerMensajes(chat.oid).subscribe(messages => {
        chat.messages = messages;
      });
      this.socket.emit('sendChatMessage', { chatId: chat.oid, message: message, user: this.myName, timestamp: new Date().toISOString()});
    });
  }

  crearChat(nombreChat: string, usuarios: string[]): void {
    if (nombreChat) {
      if (usuarios.length >= 1) {
        this.chatService.crearChat(nombreChat, usuarios).subscribe(
          response => {
              const newChat: Chat = {
                  nombre: response.chat.nombreChat,
                  oid: response.chat._id
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
      else{
        this.toastr.error("Los chats deben tener dos o más participantes");
      }
    }
    else{
      this.toastr.error("Los chats deben tener nombre");
    }
      
  }

  addUser(usuario: string): void {
    if (usuario) {
      if (usuario && !this.usuarios.includes(usuario)) {
          this.usuarios.push(usuario);
          this.nuevoUsuario = '';
      }
    }
    else{
      this.toastr.error("Introduce un nombre de usuario para añadir");
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
    const index = this.selectedChats.findIndex(selectedChat => selectedChat.oid === chat.oid);

    if (index === -1) {
        // Si el chat no está seleccionado actualmente, lo abrimos y cerramos cualquier otro chat abierto
        this.selectedChats.forEach(selectedChat => {
            this.socket.emit('exitChat', selectedChat.oid); // Salimos de cualquier chat abierto
        });

        // Limpiamos el array de chats seleccionados y agregamos el chat nuevo
        this.selectedChats = [chat];

        // Obtenemos los mensajes y participantes del nuevo chat seleccionado
        this.chatService.obtenerMensajes(chat.oid).subscribe(messages => {
            chat.messages = messages;
        });
        this.chatService.obtenerParticipantes(chat.oid).subscribe(participants => {
            chat.participants = participants;
        });

        // Emitimos el evento para unirnos al nuevo chat
        this.socket.emit('joinChat', chat.oid);
    } else {
        // Si el chat está seleccionado actualmente, lo cerramos
        this.socket.emit('exitChat', chat.oid); // Salimos del chat

        // Removemos el chat del array de chats seleccionados
        this.selectedChats.splice(index, 1);
    }
}



}