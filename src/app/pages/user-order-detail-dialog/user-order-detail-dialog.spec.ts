import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserOrderDetailDialog } from './user-order-detail-dialog';

describe('UserOrderDetailDialog', () => {
  let component: UserOrderDetailDialog;
  let fixture: ComponentFixture<UserOrderDetailDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserOrderDetailDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserOrderDetailDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
