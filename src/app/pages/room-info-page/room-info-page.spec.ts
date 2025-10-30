import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomInfoPage } from './room-info-page';

describe('RoomInfoPage', () => {
  let component: RoomInfoPage;
  let fixture: ComponentFixture<RoomInfoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomInfoPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
