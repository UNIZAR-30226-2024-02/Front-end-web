import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';  // Agrega esta línea
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
import { ReactiveFormsModule } from '@angular/forms';  // Importa ReactiveFormsModule

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
    SkinsperfilComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,  // Agrega esta línea
    AppRoutingModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
