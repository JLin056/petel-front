import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantReviewListPage } from './merchant-review-list-page';

describe('MerchantReviewListPage', () => {
  let component: MerchantReviewListPage;
  let fixture: ComponentFixture<MerchantReviewListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantReviewListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchantReviewListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
