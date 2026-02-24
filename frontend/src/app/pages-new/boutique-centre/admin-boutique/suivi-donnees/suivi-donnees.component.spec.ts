import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviDonneesComponent } from './suivi-donnees.component';

describe('SuiviDonneesComponent', () => {
  let component: SuiviDonneesComponent;
  let fixture: ComponentFixture<SuiviDonneesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuiviDonneesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuiviDonneesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
