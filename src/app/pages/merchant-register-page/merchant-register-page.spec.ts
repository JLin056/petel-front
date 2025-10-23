import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantRegisterPage } from './merchant-register-page';

describe('MerchantRegisterPage', () => {
  let component: MerchantRegisterPage;
  let fixture: ComponentFixture<MerchantRegisterPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantRegisterPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchantRegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
