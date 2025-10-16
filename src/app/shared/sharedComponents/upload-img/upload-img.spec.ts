import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadImg } from './upload-img';

describe('UploadImg', () => {
  let component: UploadImg;
  let fixture: ComponentFixture<UploadImg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadImg]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadImg);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
