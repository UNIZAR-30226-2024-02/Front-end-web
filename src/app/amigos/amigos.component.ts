import { Component, OnInit } from '@angular/core';
import { AmigosService } from './amigos.service';
import { Amigo } from './amigos'
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-amigos',
  templateUrl: './amigos.component.html',
  styleUrl: './amigos.component.css'
})
export class AmigosComponent {
  listaAmigos: string[] = [];
  id: string;

  ngOnInit(): void{
    this.getAmigos();
    console.log(this.listaAmigos);
  }
  constructor(private amigosService: AmigosService, private toastr: ToastrService) {
    this.id="";
   }
  getAmigos(){
    this.amigosService.getAmigos().subscribe(amigos => this.listaAmigos = amigos);
  }
  addAmigos(){
    const user = {idDestino: this.id}
    this.amigosService.addAmigos(user).subscribe(data => {
      this.toastr.success("Amigo añadido con éxito.")
      this.toastr.error("No se pudo añadir el usuario.")
    })
  }
  delAmigos(){
    const user = {idDestino: this.id}
    this.amigosService.delAmigos(user).subscribe(data => {
      this.toastr.success("Amigo añadido con éxito.")
      this.toastr.error("No se pudo añadir el usuario.")
    })
  }
}
