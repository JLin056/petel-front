import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSellerInfoDialog } from './add-seller-info-dialog';

describe('AddSellerInfoDialog', () => {
  let component: AddSellerInfoDialog;
  let fixture: ComponentFixture<AddSellerInfoDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSellerInfoDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSellerInfoDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
