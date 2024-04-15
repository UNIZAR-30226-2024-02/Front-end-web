import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Chat, Mensaje} from '../lobby/lobby.component'
import {Partida} from '../partidas/partidas.component';
import { UsersService } from '../users/users.service';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-partida',
  templateUrl: './partida.component.html',
  styleUrl: './partida.component.css'
})
export class PartidaComponent {
  colores = ['verde', 'rojo', 'azul', 'amarillo', 'rosa', 'morado'];
  numTropas = 0;
  tropas: Map<string, { numTropas: number, user: string }>;
  whoami : string = '';
  turnoJugador = '';
  colorMap: Map<string, string>;
  numJugadores: number = 3; // stub
  etapa: string = 'preparacion'; // preparación, juego y final
  subetapa: string = 'waiting'; // waiting, colocación, ataque, movimiento, carta
  partida: Partida = {} as Partida;
  chat : Chat = {} as Chat;
  text : string = '';
  tropasPuestas = 0;

  constructor(private toastr: ToastrService, private router: Router, private userService: UsersService, private socket: Socket) {
    this.tropas = new Map<string, { numTropas: number, user: string }>();
    this.colorMap = new Map<string, string>();
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {partida: any};
    // TODO DE MOMENTO ASÍ PERO LUEGO TENDRÉ QUE COGER LA INFO DEL BACKEND
    if (!state || !state.partida) {
      console.error('Error: No partida found');
     // this.router.navigate(['/menu']);
    } else {
      this.partida = state.partida;
      this.chat = state.partida.chat;
    }
  }

  onRegionClick(regionId: string) {
    console.log(`Se ha hecho clic en la región con ID: ${regionId}`)
  }

  distribuirPiezas(){
    switch(this.partida.jugadores.length){
      case 2: 
        this.numTropas = 40;
        break;
      case 3:
        this.numTropas = 35;
        break;
      case 4:
        this.numTropas = 30;
        break;
      case 5:
        this.numTropas = 25;
        break;
      case 6:
        this.numTropas = 20;
        break;
    }
  }

  ngOnInit() {
    // Randomly reorder the colores array (Fisher-Yates shuffle algorithm)
    for (let i = this.colores.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.colores[i], this.colores[j]] = [this.colores[j], this.colores[i]];
    }
    for(let jugador of this.partida.jugadores){
      if (this.colores.length > 0) {
        this.colorMap.set(jugador.usuario, this.colores.pop() as string);
      } else {
        console.error('No more colors available');
      }
    }
    console.log(this.colorMap)
    this.whoami = this.userService.getUsername();
    let result = this.partida.turno % this.partida.jugadores.length;
    this.turnoJugador = this.partida.jugadores[result].usuario;
    // TODO LLAMADA AL BACK QUE OBTENGA EN QUÉ ESTADO ESTÁ LA PARTIDA REALMENTE, 
    // U OBTENERLO DE LA PARTIDA REAL DE ALGÚN MODO, Y SI ES UNA PARTIDA NUEVA, HACER ESTO
    // EN CASO CONTRARIO, ACTUALIZAR EL ESTADO A SEGÚN CORRESPONDA
    this.distribuirPiezas();
  }

  onSVGLoad(event: any) {
    const svgDoc = event.target.contentDocument;
    if (svgDoc) {
      // Busca todos los elementos <path> dentro del grupo con ID "map"
      const paths = svgDoc.querySelectorAll('#map path');

      // Agrega un event listener a cada elemento <path>
      paths.forEach((path: SVGElement) => {
        path.addEventListener('click', (e: MouseEvent) => {
          this.stateMachine(path, svgDoc, e);
        });

        if (!this.tropas.has(path.id)) {
          this.tropas.set(path.id, { numTropas: 0, user: '' });
        }

      });
    }
  }

  waitForTropasPuestas(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.tropasPuestas === 1) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 1000); // Check every second
    });
  }

  async stateMachine(path : SVGElement, svgDoc : any, e: MouseEvent){
    const targetId = path.id;
    console.log(`Clic en la región con ID: ${targetId}`);
    const imgWidth = 50;
    const imgHeight = 50;
    switch(this.etapa){
      case 'preparacion':
        if(this.turnoJugador === this.whoami){
          this.tropasPuestas=0;
          this.text = 'Coloca una tropa en un país libre'
          this.colocarTropas(e, svgDoc, imgWidth, imgHeight, this.whoami, 1);
          await this.waitForTropasPuestas();
          this.turnoJugador = this.partida.jugadores[(this.partida.turno + 1) % this.partida.jugadores.length].usuario;
          console.log(this.turnoJugador)
          // TODO AVISAR AL BACK END, ESPERAR RESPUESTA Y ACTUALIZAR EL ESTADO DE LA PARTIDA
        } else {
          this.text = 'Espera tu turno'
          this.clickWrongTerrain(e, 'No es tu turno')
        }
        break;
      case 'juego':
        //this.juego(e, svgDoc, imgWidth, imgHeight);
        break;
      case 'final':
        //this.final(e, svgDoc, imgWidth, imgHeight);
        break;
    }
    //this.colocarTropas(e, svgDoc, imgWidth, imgHeight, this.whoami);
  }

  colocarTropas(e: MouseEvent, svgDoc: Document, imgWidth: number, imgHeight: number, user: string, limite? : number) {
    // Ask the user for the number of troops
    let troops;
    if(limite)
      troops = "1"
    else 
     troops = window.prompt('How many troops do you want to add?');
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
    this.tropasPuestas += numTroops;

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

  clickWrongTerrain(e: MouseEvent, errorMessage: string) {
    // Get the terrain ID
    const terrainId = (e.target as SVGElement).id;

    // Display the error message
    this.toastr.error(errorMessage);
  }
  
}
