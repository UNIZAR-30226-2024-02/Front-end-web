import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-partida',
  templateUrl: './partida.component.html',
  styleUrl: './partida.component.css'
})
export class PartidaComponent {

  constructor(private toastr: ToastrService) { }
  onRegionClick(regionId: string) {
    console.log(`Se ha hecho clic en la región con ID: ${regionId}`);
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
          this.toastr.success(`Clicked on region with ID: ${targetId}`);
        });
      });
    }
  }
  
  
  
  
}
