import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantUserpageHeader } from './merchant-userpage-header';

describe('MerchantUserpageHeader', () => {
  let component: MerchantUserpageHeader;
  let fixture: ComponentFixture<MerchantUserpageHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantUserpageHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchantUserpageHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
