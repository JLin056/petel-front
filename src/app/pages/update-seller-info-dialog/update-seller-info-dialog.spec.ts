import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSellerInfoDialog } from './update-seller-info-dialog';

describe('UpdateSellerInfoDialog', () => {
  let component: UpdateSellerInfoDialog;
  let fixture: ComponentFixture<UpdateSellerInfoDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSellerInfoDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateSellerInfoDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
