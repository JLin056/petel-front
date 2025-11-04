import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatListPage } from './cat-list-page';

describe('CatListPage', () => {
  let component: CatListPage;
  let fixture: ComponentFixture<CatListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
