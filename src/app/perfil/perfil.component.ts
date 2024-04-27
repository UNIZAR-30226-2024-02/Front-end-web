import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { UsersService } from '../users/users.service';
import { ToastrService } from 'ngx-toastr';

interface Skin {
  _id: string;
  idSkin: string;
  tipo: string;
  precio: number;
  path: string;
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  nombre: string = '';
  avatar: Skin = {} as Skin;
  puntos: number = 0;
  elo: number = 0;
  
  constructor(private router: Router, private location: Location, 
    private usersService: UsersService, 
    private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadProfile()
  }

  loadProfile(): void {
    this.usersService.getProfile().subscribe(
      (profile) => {
        this.nombre = profile.nombre;
        this.avatar = profile.avatar;
        this.puntos = profile.puntos;
        this.elo = profile.elo;
      },
      (error) => {
        console.error('Error retreiving profile:', error);
        this.toastr.error('Error al cargar el perfil', 'Error');
        if(error.status == 401) {
          this.router.navigateByUrl('/login');
        }
      }
    );
  }

}
