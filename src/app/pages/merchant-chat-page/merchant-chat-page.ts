import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chat } from '../../core/interfaces/CHAT002Res.interface';
import { CHAT003Res, Message, Room } from '../../core/interfaces/CHAT003Res.interface';
import { ChatService } from '../../core/services/chat.service';
import { CHAT002Req } from '../../core/interfaces/CHAT002Req.interface';
import { CHAT003Req } from '../../core/interfaces/CHAT003Req.interface';
import { CommonModule } from '@angular/common';
import { finalize, from, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-merchant-chat-page',
  imports: [CommonModule],
  templateUrl: './merchant-chat-page.html',
  styleUrl: './merchant-chat-page.css'
})
export class MerchantChatPage {
  /** 左側 */
  threads: Chat[] = [];
  loadingThreads = false;

  /** 選擇聊天室 */
  selectedThread: Chat | null = null;

  /** 右側 */
  room: Room | null = null;
  messages: Message[] = [];
  loadingMessages = false;

  private currentTopic: string | null = null;

  /** 滾軸 */
  @ViewChild('messagesBox') messagesBox!: ElementRef<HTMLDivElement>;

  private readonly destroy$ = new Subject<void>();
  private readonly listPageSize = 10;
  private readonly msgPageSize = 50;

  /** 注入 */
  constructor(
    private chatService: ChatService
  ) { }

  /**
   * 取得聊天室列表
   */
  getThreads(): void {
    this.loadingThreads = true;

    const req: CHAT002Req = {
      MWHEADER: {
        MSGID: 'CHAT-002'
      },
      TRANRQ: {
        pageSize: this.listPageSize,
        pageNumber: 1
      }
    }

    this.chatService.onGetThreadApi(req)
      .pipe(finalize(() => (this.loadingThreads = false)), takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const chats = res.TRANRS?.chats ?? [];

          // 由新到舊
          this.threads = chats.sort((a, b) => {
            const ta = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
            const tb = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
            return tb - ta;
          })


          if (this.threads.length > 0 && !this.selectedThread) {
            this.selectThread(this.threads[0]);
          }
        },
        error: () => {
          this.threads = [];
        }
      });
  }

  /**
   * 選擇聊天室
   * @param thread
   */
  selectThread(thread: Chat): void {
    if (this.selectedThread?.threadId === thread.threadId) return;
    this.selectedThread = thread;
    this.loadMessages(thread.threadId);
  }

  /**
   * 取得聊天室訊息內容
   * @param threadId
   */
  loadMessages(threadId: string): void {
    this.loadingMessages = true;

    const req: CHAT003Req = {
      MWHEADER: { MSGID: 'CHAT-003' },
      TRANRQ: {
        threadId,
        pageSize: this.msgPageSize,
        pageNumber: 1
      }
    };

    this.chatService.onGetMessageApi(req)
      .pipe(finalize(() => (this.loadingMessages = false)), takeUntil(this.destroy$))
      .subscribe({
        next: (res: CHAT003Res) => {
          this.room = res.TRANRS.room;

          // 由舊到新
          this.messages = (res.TRANRS.messages ?? []).sort((a, b) => {
            const ta = new Date(a.createdAt).getTime();
            const tb = new Date(b.createdAt).getTime();
            return ta - tb;
          });

          this.scrollToBottom();
        },
        error: () => {
          this.room = null;
          this.messages = [];
        }
      });
  }

  /**
   * 判斷是誰的訊息
   * @param msg
   * @returns
   */
  isMine(msg: Message): boolean {
    if (!this.room) return false;
    if (this.room.role === 'user') {
      return msg.senderId === this.room.buyerAccountId;
    }
    if (this.room.role === 'seller') {
      return msg.senderId === this.room.sellerAccountId;
    }
    return false;
  }

  sendMessage(content: string): void {
    const threadId = this.selectedThread?.threadId;
    if (!threadId) return;

    const body = {
      content,
      messageType: 'TEXT'
    };
  }

  /**
   * 時間格式化
   * @param dt
   * @returns
   */
  formatTime(dt: Date | string): string {
    const d = new Date(dt);
    if (Number.isNaN(d.getTime())) return '';

    const yy = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    const hh = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');

    return `${yy}-${mm}-${dd} ${hh}:${min}`;
  }

  /**
   * 自動捲到底
   */
  private scrollToBottom(): void {
    if (!this.messagesBox) return;
    requestAnimationFrame(() => {
      const el = this.messagesBox.nativeElement;
      el.scrollTop = el.scrollHeight;
    });
  }

  /**
   * 只更新內容，其餘不需更新
   * @param _
   * @param t
   * @returns
   */
  trackByThread(_: number, t: Chat): string {
    return t.threadId;
  }

  trackByMsg(_: number, m: Message): string {
    return m.messageId;
  }

  /**
   * 初始化
   */
  ngOnInit(): void {
    this.getThreads();
  }

  /**
   * 取消訂閱
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
