import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-socket-test',
  templateUrl: './socket-test.component.html',
  styleUrls: ['./socket-test.component.css']
})
export class SocketTestComponent implements OnInit {

  notifications: string[] = [];
  constructor(private socket: Socket) { }

  ngOnInit(): void {
    this.socket.on('friendRequest', (notification: string, user : string) => {
      this.notifications.push(notification);
      console.log('Nueva solicitud de amistad:', notification, user);
    });

    this.socket.on('gameNotification', (notification: string) => {
      this.notifications.push(notification);
      console.log('Notificación de juego:', notification);
    });

    this.socket.on('chatNotification', (notification: string) => {
      this.notifications.push(notification);
      console.log('Notificación de juego:', notification);
    });

    this.socket.on('chatMessage', (message: string) => {
      this.notifications.push(message);
      console.log('Mensaje de chat:', message);
    });
  }

  joinGame(gameId: string) {
    this.socket.emit('joinGame', gameId);
    console.log("me intento unir al juego")
  }

  joinChat(chatId: string) {
    this.socket.emit('joinChat', chatId);
    console.log("me intento unir al chat")
  }

  exitChat(chatId: string) {
    this.socket.emit('exitChat', chatId);
    console.log("me intento exitar al chat")
  }

  login(userId: string) {
    this.socket.emit('login', userId);
    console.log("User logged in:", userId);
  }

  logout(userId: string) {
    this.socket.emit('logout', userId);
    console.log("User logged out:", userId);
  }

  sendFriendRequest(userId: string, notification: string) {
    this.socket.emit('friendRequest', { userId, notification });
    console.log("intento amistar a alguien")
  
  }

  sendChatMessage(chatId: string, message: string) {
    this.socket.emit('sendChatMessage', { chatId, message });
    console.log("intento enviar mensaje al chat")
  }
  
  exitGame(gameId: string) {
    this.socket.emit('disconnectGame', gameId);
    console.log("me intento salir del juego")
  }

}
