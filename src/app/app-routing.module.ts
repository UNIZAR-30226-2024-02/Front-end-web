import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TiendaComponent } from './tienda/tienda.component';

const routes: Routes = [
  { path: 'tienda', component: TiendaComponent }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }