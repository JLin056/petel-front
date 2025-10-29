import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantUserpageFooter } from './merchant-userpage-footer';

describe('MerchantUserpageFooter', () => {
  let component: MerchantUserpageFooter;
  let fixture: ComponentFixture<MerchantUserpageFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantUserpageFooter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchantUserpageFooter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
