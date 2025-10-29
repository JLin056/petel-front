import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantOrderTablePage } from './merchant-order-table-page';

describe('MerchantOrderTablePage', () => {
  let component: MerchantOrderTablePage;
  let fixture: ComponentFixture<MerchantOrderTablePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantOrderTablePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchantOrderTablePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
