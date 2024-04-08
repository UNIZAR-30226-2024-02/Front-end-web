import { Component, OnInit } from '@angular/core';
import { AmigosService } from './amigos.service';
import { Amigo } from './amigos'

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
  constructor(private amigosService: AmigosService) { }
  getAmigos(){
    this.amigosService.getAmigos().subscribe(amigos => this.listaAmigos = amigos);
  }
}
