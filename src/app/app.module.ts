import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import appRoutes from './routerConfig';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TiendaComponent } from './tienda/tienda.component';
import { MenuComponent } from './menu/menu.component';
import { LoginComponent } from './login/login.component';
import { InicioComponent } from './inicio/inicio.component';
import { RegisterComponent } from './register/register.component';
import { RankingComponent } from './ranking/ranking.component';
import { PerfilComponent } from './perfil/perfil.component';
import { SkinsperfilComponent } from './skinsperfil/skinsperfil.component';
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { CookieService } from "ngx-cookie-service";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { FilterByTypePipe } from './pipes/filter-by-type.pipe';
import { environment } from '../environment/environment';

const config: SocketIoConfig = { url: 'http://'+ environment.backendUrl + ':4000', options: {} };

import { PartidaComponent } from './partida/partida.component';
import { ChatComponent } from './chat/chat.component';
import { AmigosComponent } from './amigos/amigos.component';
import { PartidasComponent } from './partidas/partidas.component';
import { LobbyComponent } from './lobby/lobby.component';
import { HistorialComponent } from './historial/historial.component';

import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { MonitorInterceptor } from './monitor.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    TiendaComponent,
    MenuComponent,
    LoginComponent,
    InicioComponent,
    RegisterComponent,
    RankingComponent,
    PerfilComponent,
    SkinsperfilComponent,
    FilterByTypePipe,
    PartidaComponent,
    ChatComponent,
    AmigosComponent,
    PartidasComponent,
    LobbyComponent,
    HistorialComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(appRoutes),
    FormsModule,
    HttpClientModule,
    SocketIoModule.forRoot(config),
    BrowserAnimationsModule,
    ToastrModule.forRoot()
  ],
  providers: [
    provideClientHydration(),
    CookieService,
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    {provide: HTTP_INTERCEPTORS, useClass: MonitorInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
