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
import { TuperfilComponent } from './tuperfil/tuperfil.component';
import { SkinsperfilComponent } from './skinsperfil/skinsperfil.component';
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { CookieService } from "ngx-cookie-service";
import { PartidaComponent } from './partida/partida.component';

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
    TuperfilComponent,
    SkinsperfilComponent,
    PartidaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(appRoutes),
    FormsModule,
    HttpClientModule
  ],
  providers: [
    provideClientHydration(),
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
