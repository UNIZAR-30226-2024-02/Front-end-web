import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TiendaService } from './tienda.service';
import { SkinsperfilService } from '../skinsperfil/skinsperfil.service';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

interface Skin {
  _id: string;
  idSkin: string;
  tipo: string;
  precio: number;
  path: string;
}

interface Opciones {
  sortBy: string | undefined;
  precioMin: number | undefined;
  precioMax: number | undefined;
  tipo: string | undefined;
}

@Component({
  selector: 'app-tienda',
  templateUrl: './tienda.component.html',
  styleUrl: './tienda.component.css'
})
export class TiendaComponent {
  retrievedSkins: Skin[] = [];
  enPropiedad: Skin[] = [];
  money: number = 0;
  opciones: Opciones = {
    sortBy: undefined,
    precioMin: undefined,
    precioMax: undefined,
    tipo: undefined
  };

  constructor(private router: Router, private location: Location, 
              private tiendaService: TiendaService, 
              private skinsperfilService : SkinsperfilService,
              private toastr: ToastrService) {}

  
  ngOnInit(): void {
    this.loadOwnedSkins();
    this.retrieveSkins(); 
    this.getMoney();
  }

  retrieveSkins(): void {
    this.tiendaService.getSkinsWithOptions(this.opciones).subscribe(
      (skins) => {
        this.retrievedSkins = skins;
      },
      (error) => {
        console.error('Error retreiving skins:', error);
      }
    );
  }

  buySkin(idSkin: string): void {
    this.tiendaService.buySkin(idSkin).subscribe(
      (response) => {
        console.log('Skin comprada:', response);
        this.loadOwnedSkins();
        this.retrieveSkins();
        this.toastr.success('¡Skin comprada!', 'Éxito');
      },
      (error) => {
        console.error('Error buying skin:', error);
        this.toastr.error('¡No tiene suficiente dinero!', 'Error');
      }
    );
  }

  loadOwnedSkins(): void {
    this.tiendaService.getOwnedSkins().subscribe(
      (skins) => {
        this.enPropiedad = skins;
      },
      (error) => {
        console.error('Error loading owned skins:', error);
      }
    );
  }

  isOwned(skin: Skin) {
      let bool = this.enPropiedad.some(s => s.idSkin === skin.idSkin);
      return bool;
  }

  getMoney(): void {
    this.tiendaService.getMoney().subscribe(
      (response) => {
        this.money = response.dinero;
      },
      (error) => {
        console.error('Error getting money:', error);
      }
    );
  }

}
