import { Component } from '@angular/core';
import { UsersService } from "../users/users.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  idUsuario: string;
  password: string;
  correo: string;

  constructor(public userService: UsersService, public router: Router) {
    this.correo="";
    this.password="";
    this.idUsuario="";
  }

  register() {
    const user = { idUsuario: this.idUsuario, password: this.password, correo: this.correo };
    this.userService.register(user).subscribe(data => {
      this.userService.setToken(data.token);
      this.router.navigateByUrl("/menu");
    });
  }

}
