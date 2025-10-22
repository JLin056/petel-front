import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUserTable } from './admin-user-table';

describe('AdminUserTable', () => {
  let component: AdminUserTable;
  let fixture: ComponentFixture<AdminUserTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUserTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUserTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
