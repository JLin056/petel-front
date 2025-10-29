import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantPropertyInfoPage } from './merchant-property-info-page';

describe('MerchantPropertyInfoPage', () => {
  let component: MerchantPropertyInfoPage;
  let fixture: ComponentFixture<MerchantPropertyInfoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantPropertyInfoPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchantPropertyInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
