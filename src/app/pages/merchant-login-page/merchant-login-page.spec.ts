import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantLoginPage } from './merchant-login-page';

describe('MerchantLoginPage', () => {
  let component: MerchantLoginPage;
  let fixture: ComponentFixture<MerchantLoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantLoginPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchantLoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
