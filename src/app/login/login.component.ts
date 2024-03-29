import { Component } from '@angular/core';
import { UsersService } from "../users/users.service";
import { Router } from "@angular/router";
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  id: string;
  password: string;

  constructor(public userService: UsersService, public router: Router, private socket: Socket) {
    this.id="";
    this.password="";
  }

  login() {
    const user = { id: this.id, password: this.password };
    this.userService.login(user).subscribe(data => {
      this.userService.setToken(data.token);
      this.socket.emit('login', this.id);
      this.router.navigateByUrl("/menu");
    });
  }

}
