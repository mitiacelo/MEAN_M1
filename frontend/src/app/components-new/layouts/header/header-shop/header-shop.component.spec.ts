import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderShopComponent } from './header-shop.component';

describe('HeaderShopComponent', () => {
  let component: HeaderShopComponent;
  let fixture: ComponentFixture<HeaderShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderShopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
