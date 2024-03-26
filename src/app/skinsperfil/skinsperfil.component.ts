import { Component, OnInit } from '@angular/core';
import { SkinsperfilService } from '../skinsperfil.service'; // Asegúrate de importar el servicio SkinService

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
    setfichas: Skin | null;
}

@Component({
  selector: 'app-skinsperfil',
  templateUrl: './skinsperfil.component.html',
  styleUrls: ['./skinsperfil.component.css']
})

export class SkinsperfilComponent implements OnInit {
  currentTab: string = 'owned';
  ownedSkins: Skin[] = [];
  equippedSkins: EquippedSkins = { avatar: null, terreno: null, setfichas: null };

  constructor(private skinsperfilService: SkinsperfilService) {}

  ngOnInit(): void {
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

  equipSkin(skin: Skin): void {
    //TODO
  }

  isEquipped(skin: Skin): boolean {
    //TODO
    return false; // por ahora devolvemos falso como ejemplo
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
