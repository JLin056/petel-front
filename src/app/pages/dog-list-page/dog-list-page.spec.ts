import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DogListPage } from './dog-list-page';

describe('DogListPage', () => {
  let component: DogListPage;
  let fixture: ComponentFixture<DogListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DogListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DogListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
