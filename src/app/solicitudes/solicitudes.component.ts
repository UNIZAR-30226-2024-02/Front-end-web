import { Component } from '@angular/core';
import { SolicitudesService } from './solicitudes.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.css'
})
export class SolicitudesComponent {
  listaSol: string[] = [];
  constructor(private solService: SolicitudesService, private toastr: ToastrService){

  }
  ngOnInit(): void{
    this.getSol();
    console.log(this.listaSol);
  }
  getSol(){
    this.solService.getSol().subscribe(solicitudes => this.listaSol = solicitudes);
  }
  addAmigos(id: string){
    const user = {idDestino: id}
    this.solService.addAmigos(user).subscribe(
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

}
