import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedConfirmDialog } from './shared-confirm-dialog';

describe('SharedConfirmDialog', () => {
  let component: SharedConfirmDialog;
  let fixture: ComponentFixture<SharedConfirmDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedConfirmDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedConfirmDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
