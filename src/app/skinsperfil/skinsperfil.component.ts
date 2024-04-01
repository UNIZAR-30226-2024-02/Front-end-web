import { Component, OnInit } from '@angular/core';
import { SkinsperfilService } from './skinsperfil.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

interface Skin {
  _id: string;
  idSkin: string;
  tipo: string;
  precio: number;
  path: string;
}

interface EquippedSkins {
    avatar: Skin | null;
    terreno: Skin | null;
    setFichas: Skin | null;
}

@Component({
  selector: 'app-skinsperfil',
  templateUrl: './skinsperfil.component.html',
  styleUrls: ['./skinsperfil.component.css']
})

export class SkinsperfilComponent implements OnInit {
  currentTab: string = 'owned';
  ownedSkins: Skin[] = [];
  equippedSkins: EquippedSkins = { avatar: null, terreno: null, setFichas: null };

  constructor(private router: Router, private location: Location, private skinsperfilService: SkinsperfilService) {}

  ngOnInit(): void {
    this.loadOwnedSkins(); // obtengo las skins mías
    this.loadEquippedSkins(); // obtengo las skins equipadas
  }

  fetchData(): void {
    this.loadOwnedSkins(); // obtengo las skins mías
    this.loadEquippedSkins(); // obtengo las skins equipadas
  }

  loadOwnedSkins(): void {
    this.skinsperfilService.getOwnedSkins().subscribe(
      (skins) => {
        this.ownedSkins = skins;
      },
      (error) => {
        console.error('Error loading owned skins:', error);
      }
    );
  }

  loadEquippedSkins(): void {
    this.skinsperfilService.getEquippedSkins().subscribe(
      (skins) => {
        this.equippedSkins = skins;
      },
      (error) => {
        console.error('Error loading equipped skins:', error);
      }
    );
  }

  switchTab(tab: string): void {
    this.currentTab = tab;
  }

  equipSkin(idSkin: string): void {
    this.skinsperfilService.equipSkin(idSkin).subscribe(
      (response) => {
        if (response.status === 201) {
          console.log('Skin equipped successfully!');
          this.fetchData();
        } else {
          console.error('Error equipping skin:', response.status);
        }
      },
      (error) => {
        console.error('Error equipping skin:', error);
      }
    );
  }

  isEquipped(skin: Skin): boolean | null {
    return (
      (this.equippedSkins.avatar && this.equippedSkins.avatar.idSkin === skin.idSkin) ||
      (this.equippedSkins.terreno && this.equippedSkins.terreno.idSkin === skin.idSkin) ||
      (this.equippedSkins.setFichas && this.equippedSkins.setFichas.idSkin === skin.idSkin)
    );
  }

  getBackgroundColor(tipo: string): string {
    switch (tipo) {
      case 'Avatar':
        return '#D3D3D3'; // Light Gray
      case 'SetFichas':
        return '#A9A9A9'; // Dark Gray
      case 'Terreno':
        return '#808080'; // Gray
      default:
        return '#FFFFFF'; // White
    }
  }
}
