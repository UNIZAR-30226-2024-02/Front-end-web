import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { TiendaComponent } from './tienda/tienda.component';
import { MenuComponent } from './menu/menu.component';
import { LoginComponent } from './login/login.component';

const appRoutes: Routes = [
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
    path: '',
    component: LoginComponent
  },
  {
    path: '**',
    component: LoginComponent
  }
];
export default appRoutes;