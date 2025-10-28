import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantPropertyInsertPage } from './merchant-property-insert-page';

describe('MerchantPropertyInsertPage', () => {
  let component: MerchantPropertyInsertPage;
  let fixture: ComponentFixture<MerchantPropertyInsertPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantPropertyInsertPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchantPropertyInsertPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
