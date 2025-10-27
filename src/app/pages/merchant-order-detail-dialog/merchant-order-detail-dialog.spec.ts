import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantOrderDetailDialog } from './merchant-order-detail-dialog';

describe('MerchantOrderDetailDialog', () => {
  let component: MerchantOrderDetailDialog;
  let fixture: ComponentFixture<MerchantOrderDetailDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantOrderDetailDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchantOrderDetailDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
