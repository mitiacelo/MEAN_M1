import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPopupComponent } from './register-popup.component';

describe('RegisterPopupComponent', () => {
  let component: RegisterPopupComponent;
  let fixture: ComponentFixture<RegisterPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
