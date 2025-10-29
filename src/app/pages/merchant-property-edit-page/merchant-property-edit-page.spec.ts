import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantPropertyEditPage } from './merchant-property-edit-page';

describe('MerchantPropertyEditPage', () => {
  let component: MerchantPropertyEditPage;
  let fixture: ComponentFixture<MerchantPropertyEditPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantPropertyEditPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchantPropertyEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
