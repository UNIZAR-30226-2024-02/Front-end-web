import { Component, OnInit } from '@angular/core';
import { AmigosService } from './amigos.service';
import { Amigo } from './amigos'
import { ToastrService } from 'ngx-toastr';
import { response } from 'express';
import { error } from 'console';

@Component({
  selector: 'app-amigos',
  templateUrl: './amigos.component.html',
  styleUrl: './amigos.component.css'
})
export class AmigosComponent {
  listaAmigos: string[] = [];

  ngOnInit(): void{
    this.getAmigos();
    console.log(this.listaAmigos);
  }
  constructor(private amigosService: AmigosService, private toastr: ToastrService) {}
  getAmigos(){
    this.amigosService.getAmigos().subscribe(amigos => this.listaAmigos = amigos);
  }
  addAmigos(id: string){
    const user = {idDestino: id}
    this.amigosService.addAmigos(user).subscribe(data => {
      this.toastr.success("Amigo añadido con éxito.")
      this.toastr.error("No se pudo añadir el usuario.")
    })
  }
  delAmigos(id: string){
    this.amigosService.delAmigos(id).subscribe(
      (response) => {
        console.log("Amigo eliminado con éxito");
        this.toastr.success("Amigo eliminado con éxito.");
      },
      (error) => {
        console.error('Error al eliminar amigo:', error);
        this.toastr.error("No se pudo eliminar el amigo.");
      }
    );
  }
}
