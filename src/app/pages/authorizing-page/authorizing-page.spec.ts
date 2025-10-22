import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizingPage } from './authorizing-page';

describe('AuthorizingPage', () => {
  let component: AuthorizingPage;
  let fixture: ComponentFixture<AuthorizingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorizingPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorizingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
