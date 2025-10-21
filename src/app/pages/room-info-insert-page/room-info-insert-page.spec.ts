import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomInfoInsertPage } from './room-info-insert-page';

describe('RoomInfoInsertPage', () => {
  let component: RoomInfoInsertPage;
  let fixture: ComponentFixture<RoomInfoInsertPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomInfoInsertPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomInfoInsertPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
