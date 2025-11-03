import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelSinglePage } from './hotel-single-page';

describe('HotelSinglePage', () => {
  let component: HotelSinglePage;
  let fixture: ComponentFixture<HotelSinglePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelSinglePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelSinglePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
