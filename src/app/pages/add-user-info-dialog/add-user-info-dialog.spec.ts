import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserInfoDialog } from './add-user-info-dialog';

describe('AddUserInfoDialog', () => {
  let component: AddUserInfoDialog;
  let fixture: ComponentFixture<AddUserInfoDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUserInfoDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUserInfoDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
