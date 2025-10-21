import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomInfoEditPage } from './room-info-edit-page';

describe('RoomInfoEditPage', () => {
  let component: RoomInfoEditPage;
  let fixture: ComponentFixture<RoomInfoEditPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomInfoEditPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomInfoEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
