import { Component, OnInit } from '@angular/core';
import { ChatService } from './chat.service';
import { ToastrService } from 'ngx-toastr';
import e from 'express';


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

  constructor(private chatService: ChatService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getChats();
  }

  getChats(): void {
    this.chatService.listarChats().subscribe(chats => {
      this.chats = chats;
    });
  }

  sendMessage(chat : Chat, message : string): void {
    if (!message.trim()) {
      return;
    }
    this.chatService.enviarMensaje(chat.oid, message).subscribe(response => {
      // handle response
      this.newMessage = '';
      this.chatService.obtenerMensajes(chat.oid).subscribe(messages => {
        chat.messages = messages;
      });
    });
  }

  crearChat(nombreChat: string, usuarios: string[]): void {
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
    const index = this.selectedChats.findIndex(selectedChat => selectedChat.oid === chat.oid);

    if (index === -1) {
      // The chat is not currently selected, so add it to the array
      this.chatService.obtenerMensajes(chat.oid).subscribe(messages => {
        chat.messages = messages;
      });
      this.chatService.obtenerParticipantes(chat.oid).subscribe(participants => {
        chat.participants = participants;
      });
      this.selectedChats.push(chat);
      console.log(this.selectedChats);
    } else {
        // The chat is currently selected, so remove it from the array
        this.selectedChats.splice(index, 1);
    }
  }


}