import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHotelTable } from './admin-hotel-table';

describe('AdminHotelTable', () => {
  let component: AdminHotelTable;
  let fixture: ComponentFixture<AdminHotelTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminHotelTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminHotelTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
