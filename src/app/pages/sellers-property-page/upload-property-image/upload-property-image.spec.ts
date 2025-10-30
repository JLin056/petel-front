import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadPropertyImage } from './upload-property-image';

describe('UploadPropertyImage', () => {
  let component: UploadPropertyImage;
  let fixture: ComponentFixture<UploadPropertyImage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadPropertyImage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadPropertyImage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
