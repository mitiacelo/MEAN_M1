import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalleManagerComponent } from './salle-manager.component';

describe('SalleManagerComponent', () => {
  let component: SalleManagerComponent;
  let fixture: ComponentFixture<SalleManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalleManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalleManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
