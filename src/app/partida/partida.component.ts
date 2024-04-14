import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-partida',
  templateUrl: './partida.component.html',
  styleUrl: './partida.component.css'
})
export class PartidaComponent {

  numTropas = 0;
  tropas: Map<string, { numTropas: number, user: string }>;
  whoami : string = 'player1';
  colorMap: Map<string, string>;
  numJugadores: number = 3; // stub
  etapa: string = 'preparacion'; // preparación, juego y final
  subetapa: string = 'waiting'; // waiting, colocación, ataque, movimiento, carta

  constructor(private toastr: ToastrService) {
    this.tropas = new Map<string, { numTropas: number, user: string }>();
    this.colorMap = new Map<string, string>();
  }

  onRegionClick(regionId: string) {
    console.log(`Se ha hecho clic en la región con ID: ${regionId}`)
  }

  ngOnInit() {
    this.numTropas = 35;
    this.colorMap.set('player1', 'verde');
    this.colorMap.set('player2', 'rojo');
    this.colorMap.set('player3', 'azul');
  }

  onSVGLoad(event: any) {
    const svgDoc = event.target.contentDocument;
    if (svgDoc) {
      // Busca todos los elementos <path> dentro del grupo con ID "map"
      const paths = svgDoc.querySelectorAll('#map path');

      // Agrega un event listener a cada elemento <path>
      paths.forEach((path: SVGElement) => {
        path.addEventListener('click', (e: MouseEvent) => {
          const targetId = path.id;
          console.log(`Clic en la región con ID: ${targetId}`);
          const imgWidth = 50;
          const imgHeight = 50;

          this.colocarTropas(e, svgDoc, imgWidth, imgHeight, this.whoami);
        });

        if (!this.tropas.has(path.id)) {
          this.tropas.set(path.id, { numTropas: 0, user: '' });
        }

      });
    }
  }

  colocarTropas(e: MouseEvent, svgDoc: Document, imgWidth: number, imgHeight: number, user: string) {
    // Ask the user for the number of troops
    const troops = window.prompt('How many troops do you want to add?');
    const terrainId = (e.target as SVGElement).id;
    console.log(this.tropas)
    console.log(this.whoami)

    // Check if the user clicked the Cancel button
    if (troops === null) {
      return;
    }

    let numTroops = parseInt(troops);

    if (numTroops > this.numTropas) {
      this.toastr.error('¡No tienes suficientes tropas!');
      return;
    }

    this.numTropas -= numTroops;

    const terrainInfo = this.tropas.get(terrainId);
    if (terrainInfo) {
      terrainInfo.numTropas += numTroops;
      terrainInfo.user = user;
      numTroops = terrainInfo.numTropas;
    } else {
      this.tropas.set(terrainId, { numTropas: numTroops, user });
    }

    // Check if the input is a valid number
    if (isNaN(numTroops) || numTroops < 1) {
      alert('Please enter a valid number of troops.');
      return;
    }

    // Get the point at which the click event occurred
    const svgElement = svgDoc.rootElement as SVGSVGElement;
    if (!svgElement) {
      console.error('SVG element not found');
      return;
    }

    const pt = svgElement.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    // Transform the point to the SVG coordinate system
    const screenCTM = svgElement.getScreenCTM();
    if (!screenCTM) {
      console.error('Unable to get screen CTM');
      return;
    }

    const svgP = pt.matrixTransform(screenCTM.inverse());

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', svgP.x.toString());
    text.setAttribute('y', (svgP.y + imgHeight / 2).toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '20');
    text.setAttribute('fill', 'black'); 
    text.setAttribute('stroke', 'white'); 
    text.setAttribute('stroke-width', '1');
    text.setAttribute('data-terrain-id', terrainId);
    text.textContent = numTroops.toString();

    // Calculate the number of each type of image to add
    const numTanks = Math.floor(numTroops / 10);
    let remainingTroops = numTroops % 10;
    const numHorses = Math.floor(remainingTroops / 5);
    remainingTroops %= 5;

    // Function to create and append an image
    const addImage = (href: string, index: number) => {
      const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href);
      img.setAttribute('width', imgWidth.toString());
      img.setAttribute('height', imgHeight.toString());
      img.setAttribute('x', (svgP.x - imgWidth / 2 + index * imgWidth * 0.15).toString());
      img.setAttribute('y', (svgP.y - imgHeight / 2).toString());
      img.setAttribute('data-terrain-id', terrainId);
      svgDoc.documentElement.appendChild(img);
    };

    // Delete every image in the region clicked
    // Delete every image and text in the region clicked
    const elements = svgDoc.querySelectorAll(`image[data-terrain-id="${terrainId}"], text[data-terrain-id="${terrainId}"]`);
    elements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    // Add the images
    let index = 0;
    console.log(this.whoami)
    console.log(this.colorMap.get(this.whoami))
    for (let i = 0; i < numTanks; i++, index++) {
      addImage(`/assets/tanque_${this.colorMap.get(this.whoami)}.png`, index);
    }
    for (let i = 0; i < numHorses; i++, index++) {
      addImage(`/assets/caballo_${this.colorMap.get(this.whoami)}.png`, index);
    }
    for (let i = 0; i < remainingTroops; i++, index++) {
      addImage(`/assets/infanteria_${this.colorMap.get(this.whoami)}.png`, index);
    }
    svgDoc.documentElement.appendChild(text);
  }
  
}
