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
  nuevoAmigo: string;
  listaSol: string[] = [];
  currentTab: string = 'Amigos';

  ngOnInit(): void{
    this.getAmigos();
    this.getSol();
    console.log(this.listaAmigos);
  }
  constructor(private amigosService: AmigosService, private toastr: ToastrService) {
    this.nuevoAmigo = "";
  }
  getAmigos(){
    this.amigosService.getAmigos().subscribe(amigos => this.listaAmigos = amigos);
  }
  addAmigos(){
    const user = {idDestino: this.nuevoAmigo}
    this.amigosService.addAmigos(user).subscribe(
      (response) => {
        console.log("Amigo añadido con éxito");
        this.toastr.success("Amigo añadido con éxito.");
      },
      (error) => {
        console.error('Error al añadir amigo:', error);
        this.toastr.error("No se pudo añadir el amigo.");
      }
    );
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

  getSol(){
    this.amigosService.getSol().subscribe(solicitudes => this.listaSol = solicitudes);
  }
  
  aceptarSol(id: string){
    const user = {idDestino: id}
    this.amigosService.addAmigos(user).subscribe(
      (response) => {
        console.log("Solicitud aceptada con éxito.");
        this.toastr.success("Solicitud aceptada con éxito.");
      },
      (error) => {
        console.error('Error al aceptar la solicitud:', error);
        this.toastr.error("No se pudo aceptar la solicitud.");
      }
    );
  }

  switchTab(tab: string): void {
    this.currentTab = tab;
  }
}
