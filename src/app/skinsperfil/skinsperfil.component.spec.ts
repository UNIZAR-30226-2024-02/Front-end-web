import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkinsperfilComponent } from './skinsperfil.component';

describe('SkinsperfilComponent', () => {
  let component: SkinsperfilComponent;
  let fixture: ComponentFixture<SkinsperfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkinsperfilComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkinsperfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
