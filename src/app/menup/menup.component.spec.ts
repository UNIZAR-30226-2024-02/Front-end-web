import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenupComponent } from './menup.component';

describe('MenupComponent', () => {
  let component: MenupComponent;
  let fixture: ComponentFixture<MenupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
