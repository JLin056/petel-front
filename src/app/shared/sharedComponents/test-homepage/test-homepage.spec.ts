import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestHomepage } from './test-homepage';

describe('TestHomepage', () => {
  let component: TestHomepage;
  let fixture: ComponentFixture<TestHomepage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHomepage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHomepage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
