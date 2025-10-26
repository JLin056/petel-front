import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatDemo } from './chat-demo';

describe('ChatDemo', () => {
  let component: ChatDemo;
  let fixture: ComponentFixture<ChatDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatDemo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
