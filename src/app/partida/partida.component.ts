import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import {Partida} from '../partidas/partidas.component';
import { UsersService } from '../users/users.service';
import { Socket } from 'ngx-socket-io';
import { ChangeDetectorRef } from '@angular/core';
import { ChatService } from '../chat/chat.service';
import { PartidaService } from '../partida/partida.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  @ViewChild('chatContainer', { static: false }) private chatContainer!: ElementRef;
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
  svgDoc: Document | null = null;
  eventoCancelado = false;
  // Ataque
  ataqueOrigen: string = '';
  ataqueDestino: string = '';
  ataqueTropas: number = 0; 
  avatarAMostrar = '';
  firefox = false;
  myColor = '';
  texture : string | undefined = 'assets/Risk_game_board.svg';
  ocupado = false;
  skinTropasMap: Map<string, string> = new Map<string, string>();
  //
  recolocacion = false; 
  //
  eloGanado = 0;
  puntosGanados = 0;
  intervalId: any;
  //
  paused = false;
  //
  svgURL: SafeResourceUrl = '';
ataqueRecibido: {
  userOrigen: string;
  userDestino: string;
  dadosAtacante: number[];
  dadosDefensor: number[];
  tropasPerdidasAtacante: number;
  tropasPerdidasDefensor: number;
  conquistado: boolean;
  territorioOrigen: string;
  territorioDestino: string;
  eloAtacante: number;
  eloDefensor: number;
  dineroAtacante: number;
  dineroDefensor: number;
} | null = null;

ataquePerpetrado: {
  userOrigen: string;
  userDestino: string;
  dadosAtacante: number[];
  dadosDefensor: number[];
  tropasPerdidasAtacante: number;
  tropasPerdidasDefensor: number;
  conquistado: boolean;
  territorioOrigen: string;
  territorioDestino: string;
  eloAtacante: number;
  dineroAtacante: number;
} | null = null; 

eliminado : boolean | null = null;

usoCartas: {
  cartasUsadas: Carta[];
  numCartas: number;
} | null = null;

  constructor(private toastr: ToastrService, private router: Router, private userService: UsersService, private socket: Socket,
              private cdr: ChangeDetectorRef, private chatService : ChatService, private partidaService: PartidaService, 
              private sanitizer: DomSanitizer
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {partida: any};
    this.texture = undefined;
    this.whoami = this.userService.getUsername();
    // TODO OBTENER SKIN DEL TERRENO
    this.partidaService.ObtenerTerreno(this.whoami).subscribe(response => {

      console.log('response', response);
  
      const terrenoName = response.idSkin;
      console.log('Terreno path:', terrenoName);
  
      // TODO: Use the terrenoPath variable
      // TODO Hacer que cambie en base al equipado
      switch(terrenoName){
        case 'defaultMap':
          this.texture = 'assets/Risk_game_board.svg';
          break;
        case 'lavaMap':
          this.texture = 'assets/Risk_game_board_lava.svg';
          break; 
        default:
          this.texture = 'assets/Risk_game_board.svg';
          break;
      }
      //
      this.texture = 'assets/Risk_game_board.svg';
      this.cdr.detectChanges();

    });
    this.tropas = new Map<string, { numTropas: number, user: string }>();
    this.colorMap = new Map<string, string>();
    console.log('Estado ', state)
    // TODO DE MOMENTO ASÍ PERO LUEGO TENDRÉ QUE COGER LA INFO DEL BACKEND
    if (!state || !state.partida) {
      console.error('Error: No partida found');
     // this.router.navigate(['/menu']);
    } else {
      this.partida = state.partida;
      console.log('Partida1', this.partida)
      console.log('Partida1', this.partida._id)
      this.inicializacionPartida(state.partida);
      
    }
  }

  // Obtiene la partida del back end, en su estado actual, e inicializa las variables
  inicializacionPartida(partida: Partida){
    this.partidaService.obtenerPartida(partida._id).subscribe(response => {
      console.log('Previa',  this.partida)
      console.log('nueva: ', response.partida)
      this.partida = response.partida; // cojo la partida 
      this.jugadores = response.partida.jugadores; // cojo sus jugadores, ya vienen con su color
      
      // busco mi color y de paso relleno las skins
      for(let jugador of response.partida.jugadores){
        if(jugador.usuario === this.whoami){
          this.myColor = jugador.color;
          if(jugador.abandonado){
            this.toastr.error('Has sido eliminado');
            this.eliminado = true;
            console.log(this.eliminado)
            console.log("Has perdido")
            //this.router.navigate(['/menu']);
          }
          this.eloGanado = jugador.eloGanado;
          this.puntosGanados = jugador.dineroGanado;
        }
        this.partidaService.ObtenerSetFichas(jugador.usuario).subscribe(response => {
          console.log('response', response);
          if(response.idSkin !== 'defaultFichas')
            this.skinTropasMap.set(jugador.usuario, '_' + response.idSkin);
          else 
            this.skinTropasMap.set(jugador.usuario, '');
          this.cdr.detectChanges();
          
          this.limpiarTropas();

          this.distribuirPiezas();
        });
        console.log(this.skinTropasMap)
      }
      let auxTurno = false
      if(this.turno !== response.partida.turno)
        auxTurno = true
      this.turno = response.partida.turno;
      this.cambiarTurno();
      this.turnoJugador = response.partida.jugadores[response.partida.turno % this.numJugadores].usuario;
      console.log('Turno jugador:', this.turnoJugador)
      this.nombrePartida = response.partida.nombre;
      this.numJugadores = response.partida.jugadores.length;
      this.mapa = response.partida.mapa;
      this.cartas = response.partida.cartas;
      this.descartes = response.partida.descartes;
      this.ganador = response.partida.ganador;
      this.fase = response.partida.fase;
      if(this.jugadores[this.turno % this.numJugadores].usuario === this.whoami){
        this.numTropas = response.partida.auxColocar;
        if(auxTurno) this.toastr.info('¡Es tu turno!');
      }
      this.paused = response.partida.paused;
      

      //this.turnoJugador = partida.jugadores[partida.turno % this.numJugadores].usuario;
      this.getAvatar(this.turnoJugador);

      // Si tenemos ganador... avisar
      if(this.ganador === null){
        this.mostrarGanador();
      }
      if(this.fase !== undefined) this.updateText(this.fase);

    });

  }

  // Pinta el mapa con las piezas actuales
  distribuirPiezas(){
    for(let continente of this.mapa){
      for(let territorio of continente.territorios){
        // Find the player who owns this territory
        let jugador = this.partida.jugadores.find(jugador => jugador.territorios.includes(territorio.nombre));
  
        // If a player was found, get their color
        let color = jugador ? jugador.color : undefined;
        let auxFase
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
            auxFase = this.fase
            this.fase = 0;
            svgElement.dispatchEvent(event);
            //console.log(event)
          }
        
         if(jugador && event && this.svgDoc){
          console.log(territorio.tropas)
          this.colocarTropas(event, this.svgDoc, 50, 50, jugador.usuario, true, false, territorio.tropas)
          this.fase = auxFase;
          //console.log(jugador.usuario)
          }
        }
      }
    }
    this.recolocacion = false;
  }

  ngOnInit() {
    console.log(this.colorMap)
    
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
    this.socket.on('userDisconnected', (user: string) => {
      console.log('userDisconnected', user);
      this.toastr.info(user + ' ha abandonado la partida', 'Jugador desconectado');
    });
    this.socket.on('gameOver',(posibleGanador : string) => {
        if(posibleGanador === this.whoami){
          this.toastr.success('¡Has ganado la partida!');
          this.eloGanado+=200; this.puntosGanados+=200;
        }
        this.ganador = posibleGanador;
        this.mostrarGanador();
    });

     // when the state changes (i.e a player places new troops or maniobrates)
    this.socket.on('cambioEstado', async () => {
      console.log('Partida1', this.partida)
      this.inicializacionPartida(this.partida); // actualizo el estado de la partida
      await new Promise(resolve => setTimeout(resolve, 1000)) // espero un rato

      this.limpiarTropas();

      //Pinto el mapa
      this.distribuirPiezas();
    });
    this.socket.on('partidaPausada', async () => {
      let aux = this.paused;
      this.paused = !aux;
      this.toastr.info('La partida ha sido pausada');
    })

    //when a user attacks me, I get warned and notifyied with the result of the attack
    this.socket.on('ataqueRecibido', async (userOrigen: string, userDestino: string, dadosAtacante: number[], dadosDefensor: number[], 
                                            tropasPerdidasAtacante: number, tropasPerdidasDefensor: number, conquistado: boolean,
                                            territorioOrigen: string, territorioDestino: string, eloAtacante : number, 
                                            eloDefensor: number, dineroAtacante: number, dineroDefensor: number) => {

      // update the fields in order to show the modal
      console.log("Me atacan")
      this.ataqueRecibido = { userOrigen, userDestino, dadosAtacante, dadosDefensor, 
                              tropasPerdidasAtacante, tropasPerdidasDefensor, conquistado,
                              territorioOrigen, territorioDestino, eloAtacante, eloDefensor,
                              dineroAtacante, dineroDefensor};                                    
    });

    this.intervalId = setInterval(() => {
      if (this.fase === 0 && this.jugadores[this.turno % this.numJugadores].usuario === this.whoami && this.partida.auxColocar) {
        this.numTropas = this.partida.auxColocar;
      } else {
        this.numTropas = 0;
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  ngAfterViewChecked() {
    this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
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
    if(this.fase !== undefined) this.updateText(this.fase);
    console.log(svgDoc)
    if (svgDoc) {
      // Busca todos los elementos <path> dentro del grupo con ID "map"
      const paths = svgDoc.querySelectorAll('#map path');
      // Agrega un event listener a cada elemento <path>
      paths.forEach((path: SVGElement) => {

        //path.setAttribute('fill', 'url(#lava_verde)');
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
        if (this.tropasPuestas >= 1 || this.eventoCancelado) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 1);
    });
  }

  async stateMachine(path : SVGElement, svgDoc : any, e: MouseEvent){
    const targetId = path.id
    console.log(`Clic en la región con ID: ${targetId}`)
    const imgWidth = 50
    const imgHeight = 50
    if(this.recolocacion) return;
    if (this.turnoJugador !== this.whoami) {
      this.clickWrongTerrain(e, 'No es tu turno')
      console.log('No es tu turno')
      return
    }
    if(this.paused){
      this.toastr.error('La partida está pausada');
      return;
    } 
    if(this.ocupado){ console.log("espere"); return};
    switch(this.fase){
      case 0: // colocación
        if (this.turnoJugador === this.whoami && !this.ocupado) {
          this.tropasPuestas=0
          this.eventoCancelado = false
          this.colocarTropas(e, svgDoc, imgWidth, imgHeight, this.whoami, false, false)
          await this.waitForTropasPuestas()
          if(!this.eventoCancelado){
            console.log('Popup Cartas')
            this.usoCartas = {numCartas: 0, cartasUsadas: []}
            console.log(this.numTropas)
            this.ocupado = true
            this.partidaService.ColocarTropas(this.partida._id, targetId, this.tropasPuestas).subscribe(
              response => {
                console.log(response);
                this.numTropas -= this.tropasPuestas;
                if(this.partida.auxColocar) this.partida.auxColocar -= this.tropasPuestas;
                this.tropasPuestas = 0;
                this.cdr.detectChanges();
                this.ocupado = false;
                // notify to back with a socket, the back will notify every client in the game
                console.log("EstadoCambiado:", this.partida._id)
                this.socket.emit('actualizarEstado', this.partida._id);
              },
              error => {
                this.toastr.error('¡ERROR FATAL!');
                this.colocarTropas(e, svgDoc, 50, 50, this.whoami, false, true, this.tropasPuestas);
                this.ocupado = false
                this.numTropas += this.tropasPuestas;
                this.tropasPuestas = 0;
              }
            );  
            setTimeout(() => { // si no recibo respuesta del back, está caído
              console.log("entro")
              if(this.ocupado){ 
                console.log("fatal error")
                this.toastr.error('¡ERROR FATAL!');
                this.ocupado = false;
                this.numTropas += this.tropasPuestas;
              }
            }, 2000);

          } else{
            console.log('Evento cancelado')
          }      
        } else {
          if(!this.ocupado) this.clickWrongTerrain(e, 'No es tu turno')
        }
        break
      case 1: // ataque
        // antes de atacar, selecciono las tropas q quiero utilizar para atacar
        if (this.ataqueTropas === 0) {
          console.log('Elegir y mostrar cartas')
          this.usoCartas = {numCartas: 0, cartasUsadas: []}
          
          console.log('Seleccionar tropas para atacar')
          this.ataqueTropas = 0
          this.ataqueDestino = ''
          this.ataqueOrigen = ''
          const numTroops = await this.seleccionarTropas(e, svgDoc, this.whoami, true)
          console.log(this.ataqueTropas, this.ataqueOrigen, this.ataqueDestino, numTroops)
          console.log(`Player has selected ${numTroops} troops`);
          console.log(this.recolocacion)
          this.tropasPuestas = 0
          this.colocarTropas(e, svgDoc, 50, 50, this.whoami, false, true, -numTroops) // las quito del mapa
          this.numTropas -= numTroops // tampoco las tengo colocables, las tengo seleccionadas así que las quito de ahí
          this.cdr.detectChanges()
          
        } else {
          
          // una vez seleccionadas las tropas me tocará elegir un territorio enemigo
          const enemyTerritoryId = await this.seleccionarTerritorioEnemigo(e, svgDoc, this.whoami)
          console.log(`Player has selected enemy territory ${enemyTerritoryId}`)
          this.ataqueDestino = enemyTerritoryId
          console.log("Info:", this.partida._id, this.ataqueOrigen, this.ataqueDestino, this.tropasPuestas)
          let usuarioObjetivo = this.jugadores.find(jugador => jugador.territorios.includes(enemyTerritoryId))
          this.partidaService.ResolverAtaque(this.partida._id, this.ataqueOrigen, this.ataqueDestino, -this.tropasPuestas).subscribe(
            async response => {
              console.log(response)
              this.toastr.success('¡Ataque realizado con éxito!')
              //await new Promise(resolve => setTimeout(resolve, 1000)) 
              //this.toastr.info('Tus dados: ' + response.dadosAtacante + ' Dados defensor: ' + response.dadosDefensor)
              //await new Promise(resolve => setTimeout(resolve, 1000))
              //this.toastr.info('Tus bajas: ' + response.resultadoBatalla.tropasPerdidasAtacante + ' Bajas defensor: ' + response.resultadoBatalla.tropasPerdidasDefensor)
              await new Promise(resolve => setTimeout(resolve, 1000))
              if (response.conquistado) {
                this.toastr.success('¡Territorio conquistado!')
              } else {
                this.toastr.error('¡No has conquistado el territorio!')
              }
              this.inicializacionPartida(this.partida) // actualizo el estado de la partida
              await new Promise(resolve => setTimeout(resolve, 1000)) // espero un rato

              this.limpiarTropas()

              //Pinto el mapa
              this.distribuirPiezas()
              this.ataqueDestino = ''
              this.ataqueOrigen = ''
              this.ataqueTropas = 0
              // and notify the defense player 
              
              // update the state of every client
              this.socket.emit('actualizarEstado', this.partida._id)
              
              this.socket.emit('ataco', {userOrigen: this.whoami, userDestino: usuarioObjetivo?.usuario ?? '', 
                               dadosAtacante: response.dadosAtacante, dadosDefensor: response.dadosDefensor, 
                               tropasPerdidasAtacante: response.resultadoBatalla.tropasPerdidasAtacante,
                               tropasPerdidasDefensor: response.resultadoBatalla.tropasPerdidasDefensor, 
                               conquistado: response.conquistado, territorioOrigen: this.ataqueOrigen, 
                               territorioDestino: enemyTerritoryId, eloAtacante: response.eloAtacante,
                               eloDefensor: response.eloDefensor, dineroAtacante: response.dineroAtacante,
                               dineroDefensor: response.dineroDefensor});
              this.ataquePerpetrado = {userOrigen: this.whoami, userDestino: usuarioObjetivo?.usuario ?? '', 
                                      dadosAtacante: response.dadosAtacante, dadosDefensor: response.dadosDefensor, 
                                      tropasPerdidasAtacante: response.resultadoBatalla.tropasPerdidasAtacante,
                                      tropasPerdidasDefensor: response.resultadoBatalla.tropasPerdidasDefensor, 
                                      conquistado: response.conquistado, territorioOrigen: this.ataqueOrigen, 
                                      territorioDestino: enemyTerritoryId, eloAtacante: response.eloAtacante,
                                      dineroAtacante: response.dineroAtacante};
              this.eloGanado = response.eloAtacante;
              this.puntosGanados = response.dineroAtacante;
            },
            error => {
              this.toastr.error('¡ERROR FATAL!')
              this.fase = 0;
              this.fase = 1;
              this.ataqueDestino = ''
              this.ataqueOrigen = ''
              this.ataqueTropas = 0
            }
          );
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
          console.log('espero que esto sea correcto ' + this.ataqueTropas + ' ' + this.ataqueOrigen + ' ' + this.ataqueDestino)
          this.partidaService.RealizarManiobra(this.partida._id, this.ataqueOrigen, this.ataqueDestino, this.ataqueTropas).subscribe(
            async response => {
              console.log(response)
              this.inicializacionPartida(this.partida) // actualizo el estado de la partida
              await new Promise(resolve => setTimeout(resolve, 1000)) // espero un rato
              
              this.limpiarTropas()
              
              //Pinto el mapa
              this.distribuirPiezas()
              this.ataqueDestino = ''
              this.ataqueOrigen = ''
              this.ataqueTropas = 0
              // update the state of every client
              this.socket.emit('actualizarEstado', this.partida._id)

              this.ataqueDestino = ''
              this.ataqueOrigen = ''
              this.ataqueTropas = 0
            },
            error => {
              this.toastr.error('¡ERROR FATAL!');
              this.fase = 0;
              this.fase = 1;
              this.ataqueDestino = ''
              this.ataqueOrigen = ''
              this.ataqueTropas = 0
            }
          )
        }
        break
      case 3: // uso de cartas
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
    console.log(init)
    console.log("Me llaman")
    let troops;
    //console.log(e.target)
    const terrainId = (e.target as SVGElement).id;
    let duenno = this.jugadores.find(jugador => jugador.usuario == user);
    //console.log("terreno: " + terrainId)
    //console.log("duenno: " + duenno?.territorios)
    if(!init && !this.recolocacion){
      if(!(terrainId && duenno && duenno.territorios.includes(terrainId))){
        this.toastr.error('No puedes poner tropas en territorios que no te pertenecen');
        this.cdr.detectChanges();
        this.eventoCancelado = true;
        return;
      }
    }


    if(limite !== undefined){
      troops = limite.toString();
      console.log("Entro aqui")
    } else if (this.recolocacion){
      troops = "0";
    }
    else
     troops = window.prompt('Cuántas tropas deseas añadir?');

    // Check if the user clicked the Cancel button
    if (troops === null) {
      return;
    }

    let numTroops = parseInt(troops);

    if (!init && !this.recolocacion && !select && (numTroops > this.numTropas)) {
      this.toastr.error('¡No tienes suficientes tropas!');
      console.log("Hola")
      this.eventoCancelado = true;
      this.cdr.detectChanges();
      return;
    }

    //this.numTropas -= numTroops;
    this.tropasPuestas += numTroops;

    let terrainInfo = this.tropas.get(terrainId);
    if (terrainInfo) {
      terrainInfo.numTropas += numTroops;
      terrainInfo.user = user;
      this.numTropas -= numTroops;
      numTroops = terrainInfo.numTropas;
    } else {
      this.tropas.set(terrainId, { numTropas: numTroops, user });
    }

    // Check if the input is a valid number
    if (isNaN(numTroops) || (numTroops < 1 && !select && !init && !this.recolocacion)) {
      alert('Please enter a valid number of troops.');
      this.eventoCancelado = true;
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
      addImage(`/assets/tanque${this.skinTropasMap.get(user)}_${color}.png`, index);
    }
    for (let i = 0; i < numHorses; i++, index++) {
      addImage(`/assets/caballo${this.skinTropasMap.get(user)}_${color}.png`, index);
    }
    for (let i = 0; i < remainingTroops; i++, index++) {
      addImage(`/assets/infanteria${this.skinTropasMap.get(user)}_${color}.png`, index);
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
    if(this.paused){
      this.toastr.error('La partida está pausada');
      return;
    }
   if(this.turnoJugador === this.whoami){
      this.partidaService.SiguienteFase(this.partida._id).subscribe(
        response => {
          // This will be executed when the HTTP request is successful
          this.fase = response.fase; // cojo la fase 
          if(this.turno !== response.turno){ // si ha cambiado el turno, lo cambio
            this.turno = response.turno;
            console.log("Cambia el turno")
            this.cambiarTurno();
            // y además aviso 
            this.socket.emit('actualizarEstado', this.partida._id);
          }
          if(this.fase !== undefined && this.fase !== null){
            this.updateText(this.fase);
          }
          this.cdr.detectChanges(); 
          this.eventoCancelado = true;
        },
        error => {
          // This will be executed when the HTTP request fails
          console.log(error)
          this.toastr.error(error.error.error, 'Atención');
        }
      );
    } else{
      this.toastr.error('No es tu turno');
    }
  }

  updateText(fase : number){
    if(this.turnoJugador === this.whoami){
      switch(this.fase){
        case 0:
          if(this.turnoJugador === this.whoami){
            this.text = 'Fase colocación: Coloca una tropa en un país libre'
            console.log(this.partida.auxColocar)
            this.numTropas = this.partida.auxColocar || 0 ;
            console.log(this.numTropas)
          }
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
      this.numTropas =  0 ;
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

  // Función que comprueba que un territorio es alcanzable desde el territorio de origen
  isFriendlyReachable(mapa: Continente[], origen: Territorio, destino: string, jugador: Jugador): boolean {
    if (!jugador.territorios.includes(destino)) {
      console.log("El territorio destino no pertenece al jugador")
      return false
    }
    const territorios = mapa.flatMap(continent => continent.territorios)
    const territoriosExplorados = new Set<Territorio>()
    const territoriosPorExplorar = new Set<Territorio>()
    territoriosPorExplorar.add(origen)
    while (territoriosPorExplorar.size > 0) {
      const territorioActual = territoriosPorExplorar.values().next().value

      const vecinosValidos = territorioActual.frontera.filter((vecino: string) =>               // Los vecinos válidos son los vecinos del territorio actual
        vecino != territorioActual.nombre                                                       // sin el territorio actual
        && !Array.from(territoriosExplorados).some(territorio => territorio.nombre === vecino)  // que no han sido ya explorados
        && jugador.territorios.includes(vecino)                                                 // y pertenecen al jugador
      )

      territoriosPorExplorar.delete(territorioActual)
      territoriosExplorados.add(territorioActual)
      for (let nombre of vecinosValidos) {
        const territorio = territorios.find(territorio => territorio.nombre === nombre)
        if (territorio && territorio.nombre === destino) {
          console.log("Ruta encontrada desde el territorio origen hasta el territorio destino")
          return true
        } else if (territorio) {
          territoriosPorExplorar.add(territorio)
        }
      }
    }
    console.log("No se ha encontrado una ruta desde el territorio origen hasta el territorio destino")
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
          const ok = this.isFriendlyReachable(this.mapa, origenTropas, terrainId, duenno);
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
    this.turnoJugador = this.jugadores[(this.turno) % this.numJugadores].usuario;
    console.log(this.turnoJugador)
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

  abandonarPartida() {
    if (window.confirm('¿Estás seguro que deseas abandonar la partida? Se considerará una rendición.')) {
      this.socket.off('chatMessage');
      this.socket.off('userDisconnected');
      this.socket.off('gameOver');
      this.socket.off('cambioEstado');
      this.socket.off('ataqueRecibido');
      this.partidaService.AbandonarPartida(this.partida._id).subscribe(() => {
        this.socket.emit('disconnectGame', { gameId: this.partida._id, user: this.userService.getUsername() });
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/menu']);
        });
      });
    }
  }

  mostrarGanador(){
    if(this.ganador) this.getAvatar(this.ganador);
  }

  closeWinnerModal() {
    this.socket.off('chatMessage');
    this.socket.off('userDisconnected');
    this.socket.off('gameOver');
    this.socket.off('cambioEstado');
    this.socket.off('ataqueRecibido');
    this.socket.emit('disconnectGame', { gameId: this.partida._id, user: this.userService.getUsername() });
    this.router.navigate(['/menu']);
  }

  closeAttackModal(){
    if(this.ataqueRecibido) this.ataqueRecibido = null;
    if(this.ataquePerpetrado) this.ataquePerpetrado = null; 
  }

  limpiarTropas(){
    if (this.svgDoc) {
      // Limpio las imágenes y textos de las tropas
      for(let contintente of this.mapa){
        for(let territorio of contintente.territorios){
          let terrainId = territorio.nombre; 
                  
          let troopImages = this.svgDoc.querySelectorAll(`image[data-terrain-id='${terrainId}']`);
          let textElement = this.svgDoc.querySelector(`text[data-terrain-id='${terrainId}']`);
          if (textElement) {
            textElement.remove();
          } else {
            console.log(`Text element for terrain id ${terrainId} not found`);
          }
          troopImages.forEach(image => {
            image.remove();
          });
          this.recolocacion = true;
        }
      }
    }
    // Limpio la asignación
    this.tropas.forEach(tropa => {
      tropa.user = '';
      tropa.numTropas = 0;
    });
  }

  cancelarManiobra(){
    this.ataqueOrigen = '';
    this.ataqueDestino = '';
    this.ataqueTropas = 0;
    this.recolocacion = false;
    this.inicializacionPartida(this.partida);
    this.limpiarTropas();
    this.distribuirPiezas();
  }

  pausarPartida(){
    this.partidaService.PausarPartida(this.partida._id).subscribe(() => {
      if(!this.paused){
        this.toastr.success('Partida pausada');
        this.paused = true;
        this.cdr.detectChanges();
      } else {
        this.toastr.success('Partida reanudada');
        this.paused = false;
        this.cdr.detectChanges();
      }
      this.socket.emit('pausoPartida', this.partida._id);
    });
  }

  usarCarta(cartaUsada: Carta){
    if (this.usoCartas?.numCartas) {
      if (this.usoCartas?.numCartas < 3) {
        this.usoCartas?.cartasUsadas.push(cartaUsada);
        // Eliminar del vector de cartas del jugador
        this.usoCartas.numCartas += 1;
      }
      else {
        this.toastr.error('Solo se puede usar 3 cartas')
      }
    }
    else {
      this.toastr.error('No se puede usar cartas en este momento')
    }
  }
  
  closeCartasModal(){
    if (this.usoCartas) {
      // this.partidaService.UsarCartas(this.partida._id, this.usoCartas.cartasUsadas[0], this.usoCartas.cartasUsadas[1], this.usoCartas.cartasUsadas[2])
      this.usoCartas = null;
    }
  }
}
