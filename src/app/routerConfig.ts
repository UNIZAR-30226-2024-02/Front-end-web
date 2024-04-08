import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { TiendaComponent } from './tienda/tienda.component';
import { MenuComponent } from './menu/menu.component';
import { LoginComponent } from './login/login.component';
import { InicioComponent } from './inicio/inicio.component';
import { RegisterComponent } from './register/register.component';
import { RankingComponent } from './ranking/ranking.component';
import { PerfilComponent } from './perfil/perfil.component';
import { TuperfilComponent } from './tuperfil/tuperfil.component';
import { SkinsperfilComponent } from './skinsperfil/skinsperfil.component';
import { SocketTestComponent } from './socket-test/socket-test.component';
import { PartidaComponent } from './partida/partida.component';
import { AmigosComponent } from './amigos/amigos.component';


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
    path: 'tuperfil',
    component: TuperfilComponent
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
    path: 'amigos',
    component: AmigosComponent
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