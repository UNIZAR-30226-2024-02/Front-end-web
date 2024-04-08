import { Component, OnInit } from '@angular/core';
import { ChatService } from './chat.service';


export interface Chat {
  nombre: string;
  oid: string;
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
  messages: Message[] = [];
  participants: String[] = [];
  selectedChat: Chat | null | undefined = null;
  newMessage: string = '';

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.getChats();
  }

  getChats(): void {
    this.chatService.listarChats().subscribe(chats => {
      this.chats = chats;
    });
  }

  openChat(chatId: string): void {
    this.chatService.obtenerMensajes(chatId).subscribe(messages => {
      this.messages = messages;
    });
    this.chatService.obtenerParticipantes(chatId).subscribe(participants => {
      this.participants = participants;
    });
    this.selectedChat = this.chats.find(chat => chat.oid === chatId);
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) {
      return;
    }

    if (this.selectedChat) {
      this.chatService.enviarMensaje(this.selectedChat.oid, this.newMessage).subscribe(response => {
        // handle response
        this.newMessage = '';
        if (this.selectedChat) {
          this.openChat(this.selectedChat.oid);
        }
      });
    }
  }

  //TODO
  crearChat(nombreChat: string, usuarios: string[]): void {
    this.chatService.crearChat(nombreChat, usuarios).subscribe(response => {
      // handle response
    });
  }

}