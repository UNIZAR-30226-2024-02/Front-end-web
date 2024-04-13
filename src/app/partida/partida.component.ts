import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-partida',
  templateUrl: './partida.component.html',
  styleUrl: './partida.component.css'
})
export class PartidaComponent {

  numTropas = 0;

  constructor(private toastr: ToastrService) { }
  onRegionClick(regionId: string) {
    console.log(`Se ha hecho clic en la región con ID: ${regionId}`);
  }

  ngOnInit() {
    this.numTropas = 15;
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

          // Ask the user for the number of troops
          const troops = window.prompt('How many troops do you want to add?');

          // Check if the user clicked the Cancel button
          if (troops === null) {
            return;
          }

          const numTroops = parseInt(troops);

          if (numTroops > this.numTropas) {
            this.toastr.error('¡No tienes suficientes tropas!');
            return;
          }
      
          this.numTropas -= numTroops;

          // Check if the input is a valid number
          if (isNaN(numTroops) || numTroops < 1) {
            alert('Please enter a valid number of troops.');
            return;
          }

          // Check if the input is a valid number
          if (isNaN(numTroops) || numTroops < 1) {
            alert('Please enter a valid number of troops.');
            return;
          }

          // Get the point at which the click event occurred
          const pt = svgDoc.documentElement.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;

          // Transform the point to the SVG coordinate system
          const svgP = pt.matrixTransform(svgDoc.documentElement.getScreenCTM().inverse());

          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', svgP.x.toString());
          text.setAttribute('y', (svgP.y + imgHeight / 2).toString());
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('font-size', '20');
          text.setAttribute('fill', 'black'); 
          text.setAttribute('stroke', 'white'); 
          text.setAttribute('stroke-width', '1');
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
            svgDoc.documentElement.appendChild(img);
          };

          // Add the images
          let index = 0;
          for (let i = 0; i < numTanks; i++, index++) {
            addImage('/assets/tanque_verde.png', index);
          }
          for (let i = 0; i < numHorses; i++, index++) {
            addImage('/assets/caballo_verde.png', index);
          }
          for (let i = 0; i < remainingTroops; i++, index++) {
            addImage('/assets/infanteria_verde.png', index);
          }
          svgDoc.documentElement.appendChild(text);
        });
        
      });
    }
  }
  
  
  
  
}
