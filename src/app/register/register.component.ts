import { Component } from '@angular/core';
import { UsersService } from "../users/users.service";
import { Router } from "@angular/router";
import { Socket } from 'ngx-socket-io';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

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
    if (this.esCorreo()) {
      if (this.esSegura()) {
        const user = { idUsuario: this.idUsuario, password: this.userService.encrypt(this.password), correo: this.correo };
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
      else{
        console.error('Contraseña no válida');
        this.toastr.error("La contraseña debe contener:</br>- 8 o más caracteres</br>- Al menos una letra minúscula</br>- Al menos una letra mayúscula</br>- Al menos un número</br>- Al menos un carácter especial", '', { closeButton: true, timeOut: 4000, progressBar: true, enableHtml: true });
      }
    }
    else{
      console.error('Correo no Válido');
      this.toastr.error(this.correo +" no es un correo válido.");
    }
  }

  esSegura():boolean{
    var regExpPasswd = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);
    return regExpPasswd.test(this.password);
  }

  esCorreo():boolean{
    var regExpMail = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return regExpMail.test(this.correo);
  }
}
