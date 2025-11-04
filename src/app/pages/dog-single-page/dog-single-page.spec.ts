import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DogSinglePage } from './dog-single-page';

describe('DogSinglePage', () => {
  let component: DogSinglePage;
  let fixture: ComponentFixture<DogSinglePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DogSinglePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DogSinglePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
