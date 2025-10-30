import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMerchantPage } from './user-merchant-page';

describe('UserMerchantPage', () => {
  let component: UserMerchantPage;
  let fixture: ComponentFixture<UserMerchantPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMerchantPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMerchantPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
