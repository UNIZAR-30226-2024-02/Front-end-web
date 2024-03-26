import { TestBed } from '@angular/core/testing';

import { SkinsperfilService } from './skinsperfil.service';

describe('SkinsperfilService', () => {
  let service: SkinsperfilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SkinsperfilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
