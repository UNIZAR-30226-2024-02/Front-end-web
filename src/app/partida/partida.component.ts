import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import {Partida} from '../partidas/partidas.component';
import { Chat } from '../chat/chat.component';
import { UsersService } from '../users/users.service';
import { Socket } from 'ngx-socket-io';

export interface Territorio{
  nombre: string;
  frontera: string[];
  tropas: number;
}

export interface Carta{
  territorio: string;
  estrellas: number;
}

export interface Continente{
  territorios: Territorio[];
  valor: number;
}

export interface Jugador{
  usuario: string;
  territorios: string[];
  cartas : Carta[];
  skinFichas: string;
  color: string;
  abandonado: boolean;
}


@Component({
  selector: 'app-partida',
  templateUrl: './partida.component.html',
  styleUrl: './partida.component.css'
})
export class PartidaComponent {
  // Atributos generales
  nombrePartida: string = '';
  ganador?: string | null = null;
  turno: number = 0;
  jugadores: Jugador[] = [];
  cartas: Carta[] = [];
  descartes: Carta[] = [];
  mapa: Continente[] = [];
  chat: Chat = {} as Chat;
  colores = ['verde', 'rojo', 'azul', 'amarillo', 'rosa', 'morado'];
  turnoJugador = '';
  numJugadores: number = 3; // stub
  partida: Partida = {} as Partida; // para inicializarlo
  fase?: number = 0; // Colocar- -> 0; Atacar -> 1; Maniobrar -> 2; Robar -> 3; Fin -> 4;
  // Atributos especfícios (míos, del jugador que juega en este cliente)
  numTropas = 0;
  tropas: Map<string, { numTropas: number, user: string }>;
  whoami : string = '';
  colorMap: Map<string, string>; // no parece necesario
  text : string = '';
  tropasPuestas = 0;
  /*
  // FASES PARTIDA
  const Colocar = 0;
  const Atacar = 1;
  const Maniobrar = 2;
  const Robar = 3;
  const Fin = 4; // No se usa
  */

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
      this.inicializacionPartida(state.partida);
      this.partida = state.partida;
      this.chat = state.partida.chat;
    }
  }


  cartasStub() {
    this.cartas = [
      // NA
      {territorio: "ALASKA", estrellas: 1},
      {territorio: "ALBERTA", estrellas: 2},
      {territorio: "AMERICA CENTRAL", estrellas: 1},
      {territorio: "ESTADOS UNIDOS ESTE", estrellas: 2},
      {territorio: "GROENLANDIA", estrellas: 1},
      {territorio: "TERRITORIOS DEL NOROESTE", estrellas: 2},
      {territorio: "ONTARIO", estrellas: 1},
      {territorio: "QUEBEC", estrellas: 2},
      {territorio: "ESTADOS UNIDOS OESTE", estrellas: 1},
      // SA
      {territorio: "ARGENTINA", estrellas: 1},
      {territorio: "BRASIL", estrellas: 2},
      {territorio: "PERU", estrellas: 1},
      {territorio: "VENEZUELA", estrellas: 2},
      // EU
      {territorio: "GRAN BRETANA", estrellas: 1},
      {territorio: "ISLANDIA", estrellas: 2},
      {territorio: "EUROPA NORTE", estrellas: 1},
      {territorio: "ESCANDINAVIA", estrellas: 1},
      {territorio: "EUROPA SUR", estrellas: 2},
      {territorio: "RUSIA", estrellas: 1},
      {territorio: "EUROPA OCCIDENTAL", estrellas: 1},
      // AF
      {territorio: "CONGO", estrellas: 1},
      {territorio: "AFRICA ORIENTAL", estrellas: 2},
      {territorio: "EGIPTO", estrellas: 1},
      {territorio: "MADAGASCAR", estrellas: 1},
      {territorio: "AFRICA NORTE", estrellas: 2},
      {territorio: "SUDAFRICA", estrellas: 1},
      // AS
      {territorio: "AFGANISTAN", estrellas: 1},
      {territorio: "CHINA", estrellas: 2},
      {territorio: "INDIA", estrellas: 1},
      {territorio: "IRKUTSK", estrellas: 2},
      {territorio: "JAPON", estrellas: 1},
      {territorio: "KAMCHATKA", estrellas: 2},
      {territorio: "ORIENTE MEDIO", estrellas: 1},
      {territorio: "MONGOLIA", estrellas: 2},
      {territorio: "SUDESTE ASIATICO", estrellas: 1},
      {territorio: "SIBERIA", estrellas: 2},
      {territorio: "URAL", estrellas: 1},
      {territorio: "YAKUTSK", estrellas: 2},
      // OC
      {territorio: "AUSTRALIA ORIENTAL", estrellas: 1},
      {territorio: "AUSTRALIA OCCIDENTAL", estrellas: 2},
      {territorio: "INDONESIA", estrellas: 1},
      {territorio: "NUEVA GUINEA", estrellas: 2}
    ];
  }

  mapaStub(){
    const Alaska : Territorio ={ nombre: "ALASKA", frontera: ["ALBERTA", "TERRITORIOS DEL NOROESTE", "KAMCHATKA"], tropas: Math.floor(Math.random() * 2) + 1};
    const Alberta: Territorio = { nombre: "ALBERTA", frontera: ["ALASKA", "ESTADOS UNIDOS OESTE" , "ONTARIO", "TERRITORIOS DEL NOROESTE"], tropas: Math.floor(Math.random() * 2) + 1};
    const AmericaCentral: Territorio = { nombre: "AMERICA CENTRAL", frontera: ["ESTADOS UNIDOS ESTE", "ESTADOS UNIDOS OESTE", "VENEZUELA"], tropas: Math.floor(Math.random() * 2) + 1};
    const EstadosUnidosEste: Territorio = { nombre: "ESTADOS UNIDOS ESTE", frontera: ["ALBERTA", "AMERICA CENTRAL", "ESTADOS UNIDOS OESTE", "ONTARIO"], tropas: Math.floor(Math.random() * 2) + 1};
    const Groenlandia: Territorio = { nombre: "GROENLANDIA", frontera: ["TERRITORIOS DEL NOROESTE", "ONTARIO", "QUEBEC", "ISLANDIA"], tropas: Math.floor(Math.random() * 2) + 1};
    const TerritoriosDelNoroeste: Territorio = { nombre: "TERRITORIOS DEL NOROESTE", frontera: ["ALASKA", "ALBERTA", "ONTARIO", "GROENLANDIA"], tropas: Math.floor(Math.random() * 2) + 1};
    const Ontario: Territorio = { nombre: "ONTARIO", frontera: ["TERRITORIOS DEL NOROESTE", "ALASKA", "QUEBEC", "GROENLANDIA", "ESTADOS UNIDOS OESTE", "ESTADOS UNIDOS ESTE"], tropas: Math.floor(Math.random() * 2) + 1};
    const Quebec: Territorio = { nombre: "QUEBEC", frontera: ["ONTARIO", "ESTADOS UNIDOS ESTE", "GROENLANDIA"], tropas: Math.floor(Math.random() * 2) + 1};
    const EstadosUnidosOeste: Territorio = { nombre: "ESTADOS UNIDOS OESTE", frontera: ["ESTADOS UNIDOS ESTE", "ONTARIO", "QUEBEC", "AMERICA CENTRAL"], tropas: Math.floor(Math.random() * 2) + 1};
    const Argentina: Territorio = { nombre: "ARGENTINA", frontera: ["PERU", "BRASIL"], tropas: Math.floor(Math.random() * 2) + 1};
    const Brasil: Territorio = { nombre: "BRASIL", frontera: ["ARGENTINA", "VENEZUELA", "PERU", "AFRICA NORTE"], tropas: Math.floor(Math.random() * 2) + 1};
    const Peru: Territorio = { nombre: "PERU", frontera: ["ARGENTINA", "VENEZUELA", "BRASIL"], tropas: Math.floor(Math.random() * 2) + 1};
    const Venezuela: Territorio = { nombre: "VENEZUELA ", frontera: ["AMERICA CENTRAL", "PERU", "BRASIL"], tropas: Math.floor(Math.random() * 2) + 1};
    const GranBretana: Territorio = { nombre: "GRAN BRETANA", frontera: ["EUROPA OCCIDENTAL", "EUROPA NORTE", "ESCANDINAVIA", "ISLANDIA"], tropas: Math.floor(Math.random() * 2) + 1};
    const Islandia: Territorio = { nombre: "ISLANDIA", frontera: ["GRAN BRETANA", "GROENLANDIA", "ESCANDINAVIA"], tropas: Math.floor(Math.random() * 2) + 1};
    const EuropaNorte: Territorio = { nombre: "EUROPA NORTE", frontera: ["EUROPA SUR", "EUROPA OCCIDENTAL", "RUSIA", "GRAN BRETANA", "ESCANDINAVIA"], tropas: Math.floor(Math.random() * 2) + 1};
    const Escandinavia: Territorio = { nombre: "ESCANDINAVIA", frontera: ["RUSIA", "EUROPA NORTE", "GRAN BRETANA", "ISLANDIA"], tropas: Math.floor(Math.random() * 2) + 1};
    const EuropaSur: Territorio = { nombre: "EUROPA SUR", frontera: ["EUROPA OCCIDENTAL", "EUROPA NORTE", "RUSIA", "AFRICA NORTE", "EGIPTO"], tropas: Math.floor(Math.random() * 2) + 1};
    const Rusia: Territorio = { nombre: "RUSIA", frontera: ["ESCANDINAVIA", "EUROPA NORTE", "EUROPA SUR", "URAL", "AFGANISTAN", "ORIENTE MEDIO"], tropas: Math.floor(Math.random() * 2) + 1};
    const EuropaOccidental: Territorio = { nombre: "EUROPA OCCIDENTAL", frontera: ["EUROPA NORTE", "EUROPA SUR", "AFRICA NORTE", "GRAN BRETANA"], tropas: Math.floor(Math.random() * 2) + 1};
    const Congo: Territorio = { nombre: "CONGO", frontera: ["AFRICA ORIENTAL", "SUDAFRICA", "AFRICA NORTE"], tropas: Math.floor(Math.random() * 2) + 1};
    const AfricaOriental: Territorio = { nombre: "AFRICA ORIENTAL", frontera: ["EGIPTO", "AFRICA NORTE", "CONGO", "SUDAFRICA", "MADAGASCAR"], tropas: Math.floor(Math.random() * 2) + 1};
    const Egipto: Territorio = { nombre: "EGIPTO", frontera: ["AFRICA NORTE", "AFRICA ORIENTAL", "EUROPA SUR"], tropas: Math.floor(Math.random() * 2) + 1};
    const Madagascar: Territorio = { nombre: "MADAGASCAR", frontera: ["AFRICA ORIENTAL", "SUDAFRICA"], tropas: Math.floor(Math.random() * 2) + 1};
    const AfricaNorte: Territorio = { nombre: "AFRICA NORTE", frontera: ["EGIPTO", "BRASIL", "AFRICA ORIENTAL", "CONGO"], tropas: Math.floor(Math.random() * 2) + 1};
    const Sudafrica: Territorio = { nombre: "SUDAFRICA", frontera: ["MADAGASCAR", "CONGO", "AFRICA ORIENTAL"], tropas: Math.floor(Math.random() * 2) + 1};
    const Afganistan: Territorio = { nombre: "AFGANISTAN", frontera: ["RUSIA", "URAL", "INDIA", "ORIENTE MEDIO", "CHINA"], tropas: Math.floor(Math.random() * 2) + 1};
    const China: Territorio = { nombre: "CHINA", frontera: ["INDIA", "SUDESTE ASIATIOCO", "MONGOLIA", "SIBERIA", "URAL", "AFGANISTAN"], tropas: Math.floor(Math.random() * 2) + 1};
    const India: Territorio = { nombre: "INDIA", frontera: ["CHINA", "ORIENTE MEDIO", "AFGANISTAN", "SUDESTE ASIATICO"], tropas: Math.floor(Math.random() * 2) + 1};
    const Irkutsk: Territorio = { nombre: "IRKUTSK", frontera: ["YAKUTSK", "SIBERIA", "MONGOLIA", "KAMCHATKA"], tropas: Math.floor(Math.random() * 2) + 1};
    const Japon: Territorio = { nombre: "JAPON", frontera: ["KAMCHATKA", "MONGOLIA"], tropas: Math.floor(Math.random() * 2) + 1};
    const Kamchatka: Territorio = { nombre: "KAMCHATKA", frontera: ["ALASKA", "YAKUTSK", "IRKUTSK", "MONGOLIA"], tropas: Math.floor(Math.random() * 2) + 1};
    const OrienteMedio: Territorio = { nombre: "ORIENTE MEDIO", frontera: ["RUSIA", "AFGANISTAN", "INDIA", "EGIPTO"], tropas: Math.floor(Math.random() * 2) + 1};
    const Mongolia: Territorio = { nombre: "MONGOLIA", frontera: ["IRKUTSK", "CHINA", "JAPON", "SIBERIA"], tropas: Math.floor(Math.random() * 2) + 1};
    const SudesteAsiatico: Territorio = { nombre: "SUDESTE ASIATICO", frontera: ["CHINA", "INDIA", "INDONESIA"], tropas: Math.floor(Math.random() * 2) + 1};
    const Siberia: Territorio = { nombre: "SIBERIA", frontera: ["IRKUTSK", "YAKUTSK", "MONGOLIA", "CHINA", "URAL"], tropas: Math.floor(Math.random() * 2) + 1};
    const Ural: Territorio = { nombre: "URAL", frontera: ["SIBERIA", "RUSIA", "AFGANISTAN"], tropas: Math.floor(Math.random() * 2) + 1};
    const Yakutsk: Territorio = { nombre: "YAKUTSK", frontera: ["IRKUTSK", "KAMCHATKA", "SIBERIA"], tropas: Math.floor(Math.random() * 2) + 1};
    const Indonesia: Territorio = { nombre: "INDONESIA", frontera: ["SUDESTE ASIATICO", "NUEVA GUINEA", "AUSTRALIA OCCIDENTAL"], tropas: Math.floor(Math.random() * 2) + 1};
    const NuevaGuinea: Territorio = { nombre: "NUEVA GUINEA", frontera: ["AUSTRALIA OCCIDENTAL", "AUSTRALIA ORIENTAL", "INDONESIA"], tropas: Math.floor(Math.random() * 2) + 1};
    const AustraliaOccidental: Territorio = { nombre: "AUSTRALIA OCCIDENTAL", frontera: ["AUSTRALIA ORIENTAL", "INDONESIA", "NUEVA GUINEA"], tropas: Math.floor(Math.random() * 2) + 1};
    const AustraliaOriental: Territorio = { nombre: "AUSTRALIA ORIENTAL", frontera: ["AUSTRALIA OCCIDENTAL", "NUEVA GUINEA"], tropas: Math.floor(Math.random() * 2) + 1};

    const NATerritorios: Territorio[] = [
      Alaska, Alberta, AmericaCentral, EstadosUnidosEste,
      Groenlandia, TerritoriosDelNoroeste, Ontario, Quebec, EstadosUnidosOeste
    ];

    const SATerritorios: Territorio[] = [
      Argentina, Brasil, Peru, Venezuela
    ];

    const EUTerritorios: Territorio[] = [
      GranBretana, Islandia, EuropaNorte, Escandinavia,
      EuropaSur, Rusia, EuropaOccidental
    ];

    const AFTerritorios: Territorio[] = [
      Congo, AfricaOriental, Egipto, Madagascar,
      AfricaNorte, Sudafrica
    ];

    const ASTerritorios: Territorio[] = [
      Afganistan, China, India, Irkutsk, Japon,
      Kamchatka, OrienteMedio, Mongolia, SudesteAsiatico,
      Siberia, Ural, Yakutsk
    ];

    const OCTerritorios: Territorio[] = [
      Indonesia, NuevaGuinea, AustraliaOccidental, AustraliaOriental
    ];

    // Create continents
    const NA: Continente = {
      territorios: NATerritorios,
      valor: 5
    }

    const SA: Continente = {
      territorios: SATerritorios,
      valor: 2
    }

    const EU: Continente = {
      territorios: EUTerritorios,
      valor: 5
    }

    const AF: Continente = {
      territorios: AFTerritorios,
      valor: 3
    }

    const AS: Continente = {
      territorios: ASTerritorios,
      valor: 7
    }

    const OC: Continente = {
      territorios: OCTerritorios,
      valor: 2
    }

    const Mapa: Continente[] = [NA, SA, EU, AF, AS, OC];
    this.mapa = Mapa;
    // Shuffle function
    let shuffle = (array: Territorio[]): Territorio[] => {
      let currentIndex = array.length, temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }; 

    // Flatten the Mapa array to get an array of all Territorio objects
    let allTerritories = this.mapa.flatMap(continente => continente.territorios);

    // Shuffle the territories
    let shuffledTerritories = shuffle(allTerritories);

    // Distribute the territories among the players
   this.jugadores.forEach((jugador, i) => {
      jugador.territorios = shuffledTerritories
        .filter((_: any, index: number) => index % this.jugadores.length === i)
        .slice(0, 4) // Take only the first 4 territories
        .map(territorio => territorio.nombre); // Store only the territory name
    });
  }

  inicializacionPartida(partida: Partida){
      //backend.iniciarPartida(partida._id) // TODO LLAMADA AL BACK
      // será algo así como un subscribe
      // de momento inicializo todo con los valores que conozco del lobby + stub
      this.jugadores = partida.jugadores;
      // De momento inicializo de forma stub, luego no me hará falta este trozo de código
      for(let jugador of this.jugadores){
        if (this.colores.length > 0) {
          let color = this.colores.pop();
          if (color !== undefined) {
            jugador.color = color;
          } else {
            console.error('Unexpected error: No more colors available');
          }
        } else {
          console.error('No more colors available');
        }
      }
      this.turno = partida.turno;
      this.nombrePartida = partida.nombre;
      this.numJugadores = partida.jugadores.length;
      this.mapa = partida.mapa;
      this.mapaStub(); // stub

      this.cartas = partida.cartas;
      this.cartasStub(); // stub

      this.descartes = partida.descartes;
      this.chat = partida.chat;
      this.ganador = partida.ganador;
      this.fase = partida.fase;
      this.fase = 0; // stub
      this.turnoJugador = partida.jugadores[partida.turno % this.numJugadores].usuario;
    }


  onRegionClick(regionId: string) {
    console.log(`Se ha hecho clic en la región con ID: ${regionId}`)

  }

  distribuirPiezas(){
    console.log("Continentes", this.mapa)
    console.log("Jugadores", this.jugadores)
    for(let continente of this.mapa){
      for(let territorio of continente.territorios){
        // Find the player who owns this territory
        let jugador = this.partida.jugadores.find(jugador => jugador.territorios.includes(territorio.nombre));
  
        // If a player was found, get their color
        let color = jugador ? jugador.color : undefined;
  
        console.log(`The color of territory ${territorio.nombre} is ${color}`);
        if(color !== undefined) {
         // this.colocarPiezas(territorio, color);
        }
      }
    }

    
    // Esto es stub, luego se hará una llamada al back para obtener el número de tropas
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
    console.log(this.colorMap)
    this.whoami = this.userService.getUsername();
    let result = this.partida.turno % this.partida.jugadores.length;
    this.turnoJugador = this.partida.jugadores[result].usuario;
    // TODO LLAMADA AL BACK QUE OBTENGA EN QUÉ ESTADO ESTÁ LA PARTIDA REALMENTE, 
    // U OBTENERLO DE LA PARTIDA REAL DE ALGÚN MODO, Y SI ES UNA PARTIDA NUEVA, HACER ESTO
    // EN CASO CONTRARIO, ACTUALIZAR EL ESTADO A SEGÚN CORRESPONDA
    this.mapaStub(); this.cartasStub();
    console.log(this.mapa); console.log(this.jugadores)
    this.inicializacionPartida(this.partida);
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
    switch(this.fase){
      case 0: // colocación
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
      case 1: // ataque
        //this.juego(e, svgDoc, imgWidth, imgHeight);
        break;
      case 2: // maniobra 
        //this.final(e, svgDoc, imgWidth, imgHeight);
        break;
      case 3: // robo 
        //this.final(e, svgDoc, imgWidth, imgHeight);
        break;
      case 4: // fin
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
    let jugador = this.jugadores.find(jugador => jugador.usuario === this.whoami);
    if (!jugador) {
      this.toastr.error('Ha ocurrido un error interno.', 'Atención');
      return;
    }
    let color = jugador.color;
    console.log(color)
    for (let i = 0; i < numTanks; i++, index++) {
      addImage(`/assets/tanque_${color}.png`, index);
    }
    for (let i = 0; i < numHorses; i++, index++) {
      addImage(`/assets/caballo_${color}.png`, index);
    }
    for (let i = 0; i < remainingTroops; i++, index++) {
      addImage(`/assets/infanteria_${color}.png`, index);
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
