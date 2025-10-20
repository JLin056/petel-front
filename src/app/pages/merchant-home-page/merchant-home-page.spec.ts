import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantHomePage } from './merchant-home-page';

describe('MerchantHomePage', () => {
  let component: MerchantHomePage;
  let fixture: ComponentFixture<MerchantHomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantHomePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchantHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
