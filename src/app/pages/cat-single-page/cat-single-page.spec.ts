import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatSinglePage } from './cat-single-page';

describe('CatSinglePage', () => {
  let component: CatSinglePage;
  let fixture: ComponentFixture<CatSinglePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatSinglePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatSinglePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
