import { Component } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  constructor(private socket: Socket, 
              private toastr: ToastrService) {}
  notifications: string[] = [];

  ngOnInit(): void {
    this.socket.off('friendRequest');
    this.socket.on('friendRequest', (notification: string) => {
      this.notifications.push(notification);
      console.log('Nueva solicitud de amistad:', notification);
      this.toastr.info(notification, 'Nueva solicitud de amistad:');
    });

  }
}
