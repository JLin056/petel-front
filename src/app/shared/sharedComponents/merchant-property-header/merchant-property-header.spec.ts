import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantPropertyHeader } from './merchant-property-header';

describe('MerchantPropertyHeader', () => {
  let component: MerchantPropertyHeader;
  let fixture: ComponentFixture<MerchantPropertyHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantPropertyHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchantPropertyHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
