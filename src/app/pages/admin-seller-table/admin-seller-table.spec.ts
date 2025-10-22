import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSellerTable } from './admin-seller-table';

describe('AdminSellerTable', () => {
  let component: AdminSellerTable;
  let fixture: ComponentFixture<AdminSellerTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSellerTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSellerTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
