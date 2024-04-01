import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TiendaService } from './tienda.service';
import { Location } from '@angular/common';

interface Skin {
  _id: string;
  idSkin: string;
  tipo: string;
  precio: number;
  path: string;
}

@Component({
  selector: 'app-tienda',
  templateUrl: './tienda.component.html',
  styleUrl: './tienda.component.css'
})
export class TiendaComponent {
  retrievedSkins: Skin[] = [];

  constructor(private router: Router, private location: Location, private tiendaService: TiendaService) {}

  
  ngOnInit(): void {
    this.retrieveSkins(); 
  }

  retrieveSkins(): void {
    const opciones = {
      sortBy: 'precio',
      precioMin: 0,
      precioMax: 100000000,
      tipo: undefined
    };
    this.tiendaService.getSkinsWithOptions(opciones).subscribe(
      (skins) => {
        this.retrievedSkins = skins;
      },
      (error) => {
        console.error('Error retreiving skins:', error);
      }
    );
  }

}
