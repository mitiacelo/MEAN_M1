import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutiqueManagerComponent } from './boutique-manager.component';

describe('BoutiqueManagerComponent', () => {
  let component: BoutiqueManagerComponent;
  let fixture: ComponentFixture<BoutiqueManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoutiqueManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoutiqueManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
