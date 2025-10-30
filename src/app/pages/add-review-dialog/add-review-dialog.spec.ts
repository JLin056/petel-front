import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReviewDialog } from './add-review-dialog';

describe('AddReviewDialog', () => {
  let component: AddReviewDialog;
  let fixture: ComponentFixture<AddReviewDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddReviewDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddReviewDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
