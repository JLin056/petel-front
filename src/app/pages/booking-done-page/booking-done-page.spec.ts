import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingDonePage } from './booking-done-page';

describe('BookingDonePage', () => {
  let component: BookingDonePage;
  let fixture: ComponentFixture<BookingDonePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingDonePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingDonePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
