import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TuperfilComponent } from './tuperfil.component';

describe('TuperfilComponent', () => {
  let component: TuperfilComponent;
  let fixture: ComponentFixture<TuperfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TuperfilComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TuperfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
