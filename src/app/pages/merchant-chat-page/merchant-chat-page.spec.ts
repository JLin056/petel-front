import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantChatPage } from './merchant-chat-page';

describe('MerchantChatPage', () => {
  let component: MerchantChatPage;
  let fixture: ComponentFixture<MerchantChatPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantChatPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchantChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
