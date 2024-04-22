import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import {Partida} from '../partidas/partidas.component';
import { UsersService } from '../users/users.service';
import { Socket } from 'ngx-socket-io';
import { ChangeDetectorRef } from '@angular/core';
import { ChatService } from '../chat/chat.service';

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
  colores = ['verde', 'rojo', 'azul', 'amarillo', 'rosa', 'morado'];
  turnoJugador = '';
  numJugadores: number = 3; // stub
  partida: Partida = {} as Partida; // para inicializarlo
  fase?: number = 0; // Colocar- -> 0; Atacar -> 1; Maniobrar -> 2; Robar -> 3; Fin -> 4;
  // Atributos especfícios (míos, del jugador que juega en este cliente)
  numTropas = 1000;
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
  svgDoc: Document | null = null;
  eventoCancelado = false;
  // Ataque
  ataqueOrigen: string = '';
  ataqueDestino: string = '';
  ataqueTropas: number = 0; 
  avatarAMostrar = '';
  firefox = false;

  constructor(private toastr: ToastrService, private router: Router, private userService: UsersService, private socket: Socket,
              private cdr: ChangeDetectorRef, private chatService : ChatService
  ) {
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
        .slice(0, Math.floor(shuffledTerritories.length / this.jugadores.length)) 
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

      // pueblo el chat
      console.log('El chat de la partida', this.partida.chat)
      

      this.ganador = partida.ganador;
      this.fase = partida.fase;
      this.fase = 0; // stub
      this.updateText(this.fase)
      this.turnoJugador = partida.jugadores[partida.turno % this.numJugadores].usuario;
      this.getAvatar(this.turnoJugador);
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
  
        if(color !== undefined) {
         //console.log(`The color of territory ${territorio.nombre} is ${color}`);
         let svgElement = this.svgDoc?.getElementById(territorio.nombre);
         let event: MouseEvent | undefined;
         //console.log(territorio.nombre, svgElement);
         //console.log(this.svgDoc)
          if (svgElement && svgElement.nodeName === 'path') {
            //console.log(' entro en el if')
            let bbox = ((svgElement as unknown) as SVGGraphicsElement).getBBox();
            let rect = svgElement.getBoundingClientRect();

            let centerX = rect.left + bbox.width / 2;
            let centerY = rect.top + bbox.height / 2 - 70; 

            // Create a fake MouseEvent
            event = new MouseEvent('click', {
              clientX: centerX,
              clientY: centerY,
            });
             // Dispatch the event on svgElement
            svgElement.dispatchEvent(event);
            //console.log(event)
          }
        
         if(jugador && event && this.svgDoc){
          this.colocarTropas(event, this.svgDoc, 50, 50, jugador.usuario, true, false, territorio.tropas)
          //console.log(jugador.usuario)
          }
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
    //TODO ABRIR LISTENERS DE LOS SOCKETS
    this.socket.on('chatMessage', (mensaje: string, user: string, timestamp: string, chatId: string) => {
      if (this.partida.chat) {
         if (!this.partida.chat.mensajes) {
           this.partida.chat.mensajes = [];
         }
         this.partida.chat.mensajes.push({ texto: mensaje, idUsuario: user, timestamp: timestamp});
       }
     }); 
  }

  onSVGLoad(event: any) {
    if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
      this.firefox = true;
    } else {
      this.firefox = false;
    }
    const iframeElement = event.target;
    let svgDoc = iframeElement.contentDocument;  // Get the SVG document
    const svgUrl = iframeElement.src; // Obtain the URL of the SVG
    let svgObj = '';
    console.log('URL del SVG:', svgUrl);

    

    this.svgDoc = svgDoc;
    
    this.distribuirPiezas();
    console.log(svgDoc)
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
      svgDoc.querySelectorAll('path').forEach((path: SVGElement) => {
        path.addEventListener('click', (event: MouseEvent) => {
          console.log('Path clicked:', event.target);
          // Handle the click event...
        });
      });
    }
  }

  waitForTropasPuestas(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.tropasPuestas >= 1 || this.eventoCancelado) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 1000); // Check every second
    });
  }

  async stateMachine(path : SVGElement, svgDoc : any, e: MouseEvent){
    const targetId = path.id
    console.log(`Clic en la región con ID: ${targetId}`)
    const imgWidth = 50
    const imgHeight = 50
    if (this.turnoJugador !== this.whoami) {
      this.clickWrongTerrain(e, 'No es tu turno')
      console.log('No es tu turno')
      return
    }
    switch(this.fase){
      case 0: // colocación
        if (this.turnoJugador === this.whoami) {
          this.tropasPuestas=0
          this.eventoCancelado = false
          this.colocarTropas(e, svgDoc, imgWidth, imgHeight, this.whoami, false, false)
          await this.waitForTropasPuestas()
          if(!this.eventoCancelado){
            // TODO AVISAR AL BACK END, ESPERAR RESPUESTA Y ACTUALIZAR EL ESTADO DE LA PARTIDA
            // colocarTropas(this.partida._id, this.whoami, territorio, tropas)
            // ESTO RECIBIRÁ EL BACK END
            console.log(this.partida._id, this.whoami, targetId, this.tropasPuestas)   
          }       
        } else {
          this.clickWrongTerrain(e, 'No es tu turno')
        }
        break
      case 1: // ataque
        // antes de atacar, selecciono las tropas q quiero utilizar para atacar
        if (this.ataqueTropas === 0) {
          this.ataqueTropas = 0;
          this.ataqueDestino = '';
          this.ataqueOrigen = '';
          const numTroops = await this.seleccionarTropas(e, svgDoc, this.whoami, true);
          console.log(`Player has selected ${numTroops} troops`);
          this.colocarTropas(e, svgDoc, 50, 50, this.whoami, false, true, -numTroops); // las quito del mapa
          this.numTropas -= numTroops; // tampoco las tengo colocables, las tengo seleccionadas así que las quito de ahí
          this.cdr.detectChanges()
        } else {
          // una vez seleccionadas las tropas me tocará elegir un territorio enemigo
          const enemyTerritoryId = await this.seleccionarTerritorioEnemigo(e, svgDoc, this.whoami)
          console.log(`Player has selected enemy territory ${enemyTerritoryId}`)
          this.ataqueDestino = enemyTerritoryId
          // TODO AVISAR AL BACK END, ESPERAR RESPUESTA Y ACTUALIZAR EL ESTADO DE LA PARTIDA
          //this.partida._id, this.whoami, targetId, this.tropasPuestas
          //atacarTerritorio(this.partida._id, this.whoami, this.ataqueOrigen, this.ataqueDestino, this.ataqueTropas)
          // esto recibe el back end
          console.log(this.partida._id, this.whoami, this.ataqueOrigen, this.ataqueDestino, this.ataqueTropas)
          // dependiendo del resultado de la llamada al back, se actualizará el estado de la partida y permitirá continuar
          await new Promise(resolve => setTimeout(resolve, 5000)) // falseo llamada al back
          this.resolverAtaque(this.partida._id, this.whoami, this.ataqueOrigen, this.ataqueDestino, this.ataqueTropas)
          // TODO ACTUALIZAR ESTADO ETC -> de momento no lo hago, es trivial
          this.ataqueDestino = ''
          this.ataqueOrigen = ''
          this.ataqueTropas = 0
        }

        break
      case 2: // maniobra -> reutilizo las variables de ataque jeje
        if (this.ataqueTropas === 0) {
          this.ataqueTropas = 0;
          this.ataqueDestino = ''
          this.ataqueOrigen = ''
          const numTroops = await this.seleccionarTropas(e, svgDoc, this.whoami, false)
          console.log(`Player has selected ${numTroops} troops`)
          this.colocarTropas(e, svgDoc, 50, 50, this.whoami, false, true, -numTroops) // las quito del mapa
          this.numTropas -= numTroops // tampoco las tengo colocables, las tengo seleccionadas así que las quito de ahí
          this.cdr.detectChanges()
        } else {
          // una vez seleccionadas las tropas me tocará elegir un territorio enemigo
          const enemyTerritoryId = await this.seleccionarTerritorioAmigo(e, svgDoc, this.whoami)
          console.log(`Player has selected friendly territory ${enemyTerritoryId}`)
          this.ataqueDestino = enemyTerritoryId
          // TODO AVISAR AL BACK END, ESPERAR RESPUESTA Y ACTUALIZAR EL ESTADO DE LA PARTIDA
          //this.partida._id, this.whoami, targetId, this.tropasPuestas
          //atacarTerritorio(this.partida._id, this.whoami, this.ataqueOrigen, this.ataqueDestino, this.ataqueTropas)
          // esto recibe el back end
          console.log(this.partida._id, this.whoami, this.ataqueOrigen, this.ataqueDestino, this.ataqueTropas)
          // dependiendo del resultado de la llamada al back, se actualizará el estado de la partida y permitirá continuar
          await new Promise(resolve => setTimeout(resolve, 5000)) // falseo llamada al back
          const territorios = this.mapa.flatMap(continent => continent.territorios)
          const destinoTropas = await territorios.find(territorio => territorio.nombre === this.ataqueDestino)
          if (destinoTropas)
            destinoTropas.tropas += this.ataqueTropas // seguramente esto te lo dé el back? tampoco está mal hacerlo localmente
          this.colocarTropas(e, svgDoc, 50, 50, this.whoami, false, true, this.ataqueTropas) // las pongo
          console.log(destinoTropas)
          // TODO ACTUALIZAR ESTADO ETC -> de momento no lo hago, es trivial
          this.ataqueDestino = ''
          this.ataqueOrigen = ''
          this.ataqueTropas = 0
        }
        break
      case 3: // robo 
        //this.final(e, svgDoc, imgWidth, imgHeight);
        break
      case 4: // fin
        //this.final(e, svgDoc, imgWidth, imgHeight);
        break
    }
    //this.colocarTropas(e, svgDoc, imgWidth, imgHeight, this.whoami);
    this.cdr.detectChanges()
  }

  colocarTropas(e: MouseEvent, svgDoc: Document, imgWidth: number, imgHeight: number, user: string, init : boolean, select : boolean, limite? : number) {
    // Ask the user for the number of troops

    let troops;
    console.log(e.target)
    const terrainId = (e.target as SVGElement).id;
    let duenno = this.jugadores.find(jugador => jugador.usuario == user);
    console.log("terreno: " + terrainId)
    console.log("duenno: " + duenno?.territorios)
    if(!(terrainId && duenno && duenno.territorios.includes(terrainId))){
      this.toastr.error('No puedes poner tropas en territorios que no te pertenecen');
      this.cdr.detectChanges();
      return;
    }

    if(limite)
      troops = limite.toString();
    else 
     troops = window.prompt('Cuántas tropas deseas añadir?');

    // Check if the user clicked the Cancel button
    if (troops === null) {
      return;
    }

    let numTroops = parseInt(troops);

    if (!init && (numTroops > this.numTropas)) {
      this.toastr.error('¡No tienes suficientes tropas!');
      this.cdr.detectChanges();
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
    if (isNaN(numTroops) || (numTroops < 1 && !select)) {
      alert('Please enter a valid number of troops.');
      this.cdr.detectChanges();
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
      img.style.pointerEvents = 'none'; // Make the image click-through
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
    let jugador = this.jugadores.find(jugador => jugador.usuario === user);
    if (!jugador) {
      this.toastr.error('Ha ocurrido un error interno.', 'Atención');
      return;
    }
    let color = jugador.color;
    //console.log(color)
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
    this.cdr.detectChanges();
    
  }

  updateFase(){
    //TODO -> CONECTAR AL BACK END, ESTO ES UN STUB
    if(this.fase !== undefined && this.fase !== null){
      this.fase = (this.fase + 1) % 4;
      console.log(this.fase)
      this.updateText(this.fase);
    } else {
      this.toastr.error('Ha ocurrido un error intero', 'Atención');
    }
    this.cdr.detectChanges();
    this.eventoCancelado = true;
  }

  updateText(fase : number){
    if(this.turnoJugador === this.whoami){
      switch(this.fase){
        case 0:
          if(this.turnoJugador === this.whoami)
            this.text = 'Fase colocación: Coloca una tropa en un país libre'
          else 
            this.text = 'Espera tu turno'
          break;
        case 1:
          this.text = 'Fase ataque: Mueve las tropas de un país tuyo a uno enemigo contiguo'
          break;
        case 2:
          this.text = 'Fase maniobra: Mueve las tropas de un país tuyo a otro tuyo'
          break;
        case 3:
          this.text = 'Fase robo: Roba una carta'
          break;
      }
    } else {
      this.text = 'Espera tu turno'
    }
  }

  /*
    Puedes enviar hasta 3 tropas para atacar al mismo tiempo. No importa cuántas
    tropas haya en tu territorio atacante, cada ataque puede usar sólo 1,
    2 ó 3 atacantes. Cuando muevas tropas a un territorio para atacarlo, deja siempre 
    al menos 1 tropa en tu territorio para protegerlo.  
  */
  seleccionarTropas(e: MouseEvent, svgDoc: Document, user: string, attack: boolean): Promise<number> {
    console.log('Seleccionar tropas');
    return new Promise((resolve, reject) => {
      
      const terrainId = (e.target as SVGElement).id;
      let duenno = this.jugadores.find(jugador => jugador.usuario == user);
      if (!(terrainId && duenno && duenno.territorios.includes(terrainId))) {
        this.toastr.error('No puedes seleccionar tropas en territorios que no te pertenecen');
        this.cdr.detectChanges();
        reject('Cannot select troops from territories you do not own');
        return;
      }
      
      // Ask the user for the number of troops
      const troops = window.prompt('¿Cuántas tropas deseas seleccionar?');

      // Check if the user clicked the Cancel button
      if (troops === null) {
        reject('No troops selected');
        return;
      }

      let numTroops = parseInt(troops);

      // Check if the input is a valid number
      if (isNaN(numTroops) || numTroops < 1) {
        this.toastr.error('Por favor, introduce un número válido de tropas.');
        this.cdr.detectChanges();
        reject('Invalid number of troops');
        return;
      }

      if (attack && numTroops > 3) {
        console.log(attack)
        this.toastr.error('Sólo puedes seleccionar hasta 3 tropas para atacar.')
        this.cdr.detectChanges();
        reject('Too many troops selected');
        return;
      }

      const terrainInfo = this.tropas.get(terrainId);
      if (terrainInfo) {
        if (terrainInfo.numTropas < numTroops + 1) { // se debe dejar al menos una tropa y no quedarnos con tropas negativasd
          this.toastr.error('No tienes suficientes tropas en este territorio. Recuerda que debes dejar al menos una tropa.');
          this.cdr.detectChanges();
          reject('Not enough troops in this territory');
          return;
        }
        this.ataqueTropas += numTroops;
      } else {
        this.toastr.error('Ha ocurrido un error interno.', 'Atención');
        reject('Internal error');
        return;
      }

      this.toastr.success(`Has seleccionado ${numTroops} tropas.`);
      this.ataqueOrigen = terrainId;
      this.cdr.detectChanges();
      resolve(numTroops);
    });
  }

  seleccionarTerritorioEnemigo(e: MouseEvent, svgDoc: Document, user: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const terrainId = (e.target as SVGElement).id;
      let duenno = this.jugadores.find(jugador => jugador.usuario == user);

      // Check if the territory belongs to the player (it should not)
      if (terrainId && duenno && duenno.territorios.includes(terrainId)) {
        this.toastr.error('No puedes atacar tu propio territorio');
        this.cdr.detectChanges();
        reject('Cannot select your own territory');
        return;
      }

      // Get the origin of the attack
      const territorios = this.mapa.flatMap(continent => continent.territorios);
      const origenAtaque = territorios.find(territorio => territorio.nombre === this.ataqueOrigen);

      // Check if the origin of the attack exists and has a border
      if (origenAtaque && origenAtaque.frontera) {
        // Check if the selected territory is in the border of the origin of the attack
        if (origenAtaque.frontera.includes(terrainId)) {
          // The selected territory is in the border of the origin of the attack, everything is ok 
        } else {
          // The selected territory is not in the border of the origin of the attack --> fatal error user is stupid xd
          this.toastr.error('El territorio seleccionado no está en la frontera del origen del ataque');
          this.cdr.detectChanges();
          reject('The selected territory is not in the border of the origin of the attack');
          return;
        }
      } else {
        // The origin of the attack does not exist or does not have a border (never should happen... )
        this.toastr.error('El origen del ataque no existe o no tiene una frontera');
        this.cdr.detectChanges();
        reject('The origin of the attack does not exist or does not have a border');
        return;
      }

      // Check if the territory exists and belongs to an enemy
      const terrainInfo = this.tropas.get(terrainId);
      if (terrainInfo) {
        const enemy = this.jugadores.find(jugador => jugador.territorios.some(territorio => territorio == terrainId));
        if (!enemy) {
          this.toastr.error('Este territorio no pertenece a ningún enemigo');
          this.cdr.detectChanges();
          reject('This territory does not belong to an enemy');
          return;
        }
      } else {
        this.toastr.error('Ha ocurrido un error interno.', 'Atención');
        reject('Internal error');
        return;
      }

      this.toastr.success(`Has seleccionado el territorio enemigo ${terrainId}`);
      const enemyTerritoryElement = svgDoc.getElementById(terrainId);
      if (enemyTerritoryElement) {
        let isRed = true;
        const animation = setInterval(() => {
          enemyTerritoryElement.style.fill = isRed ? 'red' : 'yellow';
          isRed = !isRed;
        }, 1000);
      
        setTimeout(() => {
          // Stop the animation after 5 seconds
          clearInterval(animation);
          // Continue with the rest of your code here
        }, 5000);
      }
      this.cdr.detectChanges();
      resolve(terrainId);
    });
  }

  isFriendlyReachable(origen: Territorio, destino: string, duenno: Jugador): boolean {
    const territorios = this.mapa.flatMap(continent => continent.territorios)
    const territoriosExplorados = new Set<Territorio>()
    const territoriosPorExplorar = new Set<Territorio>()
    territoriosPorExplorar.add(origen)
    while (territoriosPorExplorar.size > 0) {
      const territorio = territoriosPorExplorar.values().next().value
      territoriosPorExplorar.delete(territorio)
      territoriosExplorados.add(territorio)
      for (let nombre of territorio.frontera) {
        const territorio = territorios.find(territorio => territorio.nombre === nombre)
        if (territorio && territorio.nombre === destino) {
          return true
        } else if (territorio && duenno.territorios.includes(nombre) && !territoriosExplorados.has(territorio)) {
          territoriosPorExplorar.add(territorio)
        }
      }
    }
    return false
  }

  seleccionarTerritorioAmigo(e: MouseEvent, svgDoc: Document, user: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const terrainId = (e.target as SVGElement).id;
      let duenno = this.jugadores.find(jugador => jugador.usuario == user);

      // Check if the territory belongs to the player (it should)
      if (terrainId && duenno && !duenno.territorios.includes(terrainId)) {
        this.toastr.error('No puedes mover tropas fuera de tu territorio');
        this.cdr.detectChanges();
        reject('Must select your own territory');
        return;
      }

      // Get the origin of the troops
      const territorios = this.mapa.flatMap(continent => continent.territorios);
      const origenTropas = territorios.find(territorio => territorio.nombre === this.ataqueOrigen);

      // Check if the origin of the troops exists and has a border
      if (origenTropas && origenTropas.frontera) {
        if (duenno) {
          // Search borders until exhaustion
          const ok = this.isFriendlyReachable(origenTropas, terrainId, duenno);
          // TODO comprobar que funcione
          console.log(ok)
          if (!ok) {
            // The selected territory is not in the border of the origin of the troops --> fatal error user is stupid xd
            this.toastr.error('El territorio seleccionado no está conectado con el origen de las tropas')
            this.cdr.detectChanges()
            reject('The selected territory is not connected to the origin of the troops')
            return
          }
        }
      } else {
        // The origin of the troops does not exist or does not have a border (never should happen... )
        this.toastr.error('El origen de las tropas no existe o no tiene una frontera');
        this.cdr.detectChanges();
        reject('The origin of the troops does not exist or does not have a border');
        return;
      }

      // Check if the territory exists and belongs to the player
      const terrainInfo = this.tropas.get(terrainId);
      if (terrainInfo) {
        const terrainOwner = this.jugadores.find(jugador => jugador.territorios.some(territorio => territorio == terrainId));
        if (terrainOwner != duenno) {
          this.toastr.error('Este territorio no te pertenece');
          this.cdr.detectChanges();
          reject('This territory does not belong to you');
          return;
        }
      } else {
        this.toastr.error('Ha ocurrido un error interno.', 'Atención');
        reject('Internal error');
        return;
      }

      this.toastr.success(`Has seleccionado tu territorio ${terrainId}`);
      const territoryElement = svgDoc.getElementById(terrainId);
      if (territoryElement) {
        // TODO quizás renta hacer una animación: (+numero de tropas, por ejemplo)
      }
      this.cdr.detectChanges();
      resolve(terrainId);
    });
  }

  numTropasTerritorio(territorioName : string) : number{
    let troops = 0;

    for (let continente of this.mapa) {
      for (let territorio of continente.territorios) {
        if (territorio.nombre === territorioName) {
          troops = territorio.tropas;
          break;
        }
      }
    }
    return troops;
  }

  cambiarTurno(){
    this.turnoJugador = this.jugadores[(this.turno + 1) % this.numJugadores].usuario;
    this.turno++;
    this.fase = 0;
    this.getAvatar(this.turnoJugador);
  }

  // TODO -> será una simple llamada al back , de momento lo falseo para poder seguir haciendo cosas
  resolverAtaque(partida: string, jugador: string, origen: string, destino: string, tropas: number){
    // resolverAtaque(this.partida._id, this.whoami, this.ataqueOrigen, this.ataqueDestino, this.ataqueTropas)
    console.log(this.partida._id, this.whoami, this.ataqueOrigen, this.ataqueDestino, this.ataqueTropas)
    // ESTO LO HARÁ EL BACK DE MOMENTO LO METO COMO STUB PARA PODER SEGUIR AVANZANDO
    let troops = 0;
    let territorioName = destino;

    for (let continente of this.mapa) {
      for (let territorio of continente.territorios) {
        if (territorio.nombre === territorioName) {
          troops = territorio.tropas;
          break;
        }
      }
    }
    let tropasDefensoras = 0;
    if(this.numTropasTerritorio(destino) > 1) tropasDefensoras = Math.floor(Math.random() * 2) + 1;
    else tropasDefensoras = 1;
    console.log('El enemigo defiende con ', tropasDefensoras)
    this.toastr.success('El enemigo ha defendido con ' + tropasDefensoras + ' tropas')
    let dadosNegros : number[] = [];
    let dadosRojos : number[] = [];
    for(let i = 0; i < tropas; i++){
      dadosNegros.push(Math.floor(Math.random() * 6) + 1);
    }
    for(let i = 0; i < tropasDefensoras; i++){
      dadosRojos.push(Math.floor(Math.random() * 6) + 1);
    }
    dadosNegros.sort((a, b) => b - a);
    dadosRojos.sort((a, b) => b - a);
    console.log('Mis dados', dadosNegros)
    console.log('Dados enemigos', dadosRojos)
    let muertosAtacante = 0;
    let muertosDefensor = 0;
    for(let i = 0; i < tropasDefensoras; i++){
      if(dadosNegros[i] > dadosRojos[i]){
        muertosDefensor++;
      } else {
        muertosAtacante++;
      }
    }
    console.log('Muertos atacante', muertosAtacante)
    console.log('Muertos defensor', muertosDefensor)
    this.toastr.success('Has perdido ' + muertosAtacante + ' tropas')
    this.toastr.success('El enemigo ha perdido ' + muertosDefensor + ' tropas')
    this.cdr.detectChanges();
    // FIN DEL STUB
    if(this.numTropasTerritorio(destino) === 0){
      this.toastr.success('Has conquistado ' + destino)
      console.log('Has conquistado ' + destino)
      this.cdr.detectChanges();
      // 1. Add the territory to the player with jugador.usuario === whoami
      let jugador = this.jugadores.find(j => j.usuario === this.whoami);
      if (jugador) {
        jugador.territorios.push(destino);
      }

      // 2. Remove the territory from the player who currently owns it
      for (let j of this.jugadores) {
        let index = j.territorios.indexOf(destino);
        if (index !== -1) {
          j.territorios.splice(index, 1);
          break;
        }
      }
    }
  }

  getAvatar(user: string) {
    this.userService.getUserSkin(user).subscribe(response => {
      this.avatarAMostrar = response.path;
      console.log('skin', this.avatarAMostrar);
    });
  }

  sendMessage(texto: string) {
    console.log("El chat", this.partida.chat)
    console.log(this.partida.chat._id, texto, this.whoami)
    if (this.partida.chat && this.partida.chat.mensajes) { // Check if chat and messages are defined
      this.partida.chat.mensajes.push({
        texto: texto,
        idUsuario: this.whoami,
        timestamp: new Date().toISOString(),
      });
    }
    this.chatService.enviarMensaje(this.partida.chat._id, texto).subscribe(() => {
      this.socket.emit('sendChatMessage', {
        chatId: this.partida.chat._id,
        message: texto,
        user: this.whoami,
        timestamp: new Date().toISOString()
      });
    });
  }
  
}
