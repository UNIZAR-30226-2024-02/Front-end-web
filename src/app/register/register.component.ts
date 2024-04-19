import { Component } from '@angular/core';
import { UsersService } from "../users/users.service";
import { Router } from "@angular/router";
import { Socket } from 'ngx-socket-io';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  idUsuario: string;
  password: string;
  correo: string;

  constructor(public userService: UsersService, public router: Router, private socket: Socket, private toastr: ToastrService) {
    this.correo="";
    this.password="";
    this.idUsuario="";
  }

  register() {
    const user = { idUsuario: this.idUsuario, password: this.password, correo: this.correo };
    this.userService.register(user).subscribe(
      (data) => {
        this.userService.setToken(data.token);
        this.userService.setUsername(data.idUsuario);
        this.socket.emit('login', this.idUsuario);
        this.router.navigateByUrl("/menu");
      },
      (error) => {
        this.toastr.error(error.error.error, 'Error', { timeOut: 5000 });
      }
    );
  }

}
