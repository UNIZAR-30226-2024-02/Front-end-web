import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { TiendaComponent } from './tienda/tienda.component';
import { MenuComponent } from './menu/menu.component';
import { LoginComponent } from './login/login.component';
import { InicioComponent } from './inicio/inicio.component';
import { RegisterComponent } from './register/register.component';
import { RankingComponent } from './ranking/ranking.component';
import { PerfilComponent } from './perfil/perfil.component';
import { SkinsperfilComponent } from './skinsperfil/skinsperfil.component';
import { SocketTestComponent } from './socket-test/socket-test.component';
import { PartidaComponent } from './partida/partida.component';
import { AmigosComponent } from './amigos/amigos.component';
import { ChatComponent } from './chat/chat.component';
import { PartidasComponent } from './partidas/partidas.component';
import { LobbyComponent } from './lobby/lobby.component';
import { HistorialComponent } from './historial/historial.component';


const appRoutes: Routes = [
  {
    path: 'register',
    component: RegisterComponent
  },
  { path: 'login', 
    component: LoginComponent 
  },
  {
    path: 'tienda',
    component: TiendaComponent
  },
  { path: 'menu',
    component: MenuComponent
  },
  {
    path: 'ranking',
    component: RankingComponent
  },
  {
    path: 'perfil',
    component: PerfilComponent
  },
  {
    path: 'skinsperfil',
    component: SkinsperfilComponent
  },
  {
    path: 'socket-test',
    component: SocketTestComponent
  },
  {
    path: 'partida',
    component: PartidaComponent
  },
  {
    path: 'partidas', 
    component: PartidasComponent
  },
  {
    path: 'amigos',
    component: AmigosComponent
  },
  { // pantalla de prueba para probar los chats
    path: 'chat',
    component: ChatComponent
  },
  {
    path: 'lobby',
    component: LobbyComponent
  },
  {
    path: 'historial',
    component: HistorialComponent
  },
  {
    path: '',
    component: InicioComponent
  },
  {
    path: '**',
    component: InicioComponent
  }

];
export default appRoutes;