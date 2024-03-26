import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByType'
})
export class FilterByTypePipe implements PipeTransform {

  transform(skins: any[] | null, type: string): any[] {
    return skins ? skins.filter(skin => skin.tipo === type) : [];
  }

}