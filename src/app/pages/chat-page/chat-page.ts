import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chat } from '../../core/interfaces/CHAT002Res.interface';
import { CHAT003Res, Message, Room } from '../../core/interfaces/CHAT003Res.interface';
import { ChatService } from '../../core/services/chat.service';
import { CHAT002Req } from '../../core/interfaces/CHAT002Req.interface';
import { CHAT003Req } from '../../core/interfaces/CHAT003Req.interface';
import { CommonModule } from '@angular/common';
import { filter, finalize, Subject, takeUntil } from 'rxjs';
import { ChatMessage } from '../../core/interfaces/ChatMessage.interface';
import { WsService } from '../../core/services/ws.service';
import { FormsModule } from '@angular/forms';
import { ThreadUpdate } from '../../core/interfaces/ThreadUpdate.interface';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TagModule],
  templateUrl: './chat-page.html',
  styleUrl: './chat-page.css'
})
export class ChatPage {

    /** 左側 */
    threads: Chat[] = [];
    loadingThreads = false;

    /** 選擇聊天室 */
    selectedThread: Chat | null = null;

    /** 右側 */
    room: Room | null = null;
    messages: ChatMessage[] = [];
    loadingMessages = false;

    draft = '';

    /** 滾軸 */
    @ViewChild('messagesBox') messagesBox!: ElementRef<HTMLDivElement>;

    private destroy$ = new Subject<void>();
    private listPageSize = 10;
    private threadPage = 1;
    private threadHasMore = true;

    private msgPageSize = 50;
    private msgPage = 1;
    private msgHasMore = true;
    private loadingOlder = false;



    /** 注入 */
    constructor(
        private chatService: ChatService,
        private ws: WsService
    ) {}

    /**
     * 取得聊天室列表
     */
    getThreads(reset = false): void {
        if (this.loadingThreads || (!this.threadHasMore && !reset)) return;

        if (reset) {
            this.threadPage = 1;
            this.threadHasMore = true;
            this.threads = [];
        }

        this.loadingThreads = true;

        const req: CHAT002Req = {
            MWHEADER: {
                MSGID: 'CHAT-002'
            },
            TRANRQ: {
                pageSize: this.listPageSize,
                pageNumber: this.threadPage
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

                    this.threads = [...this.threads, ...chats];

                    if (chats.length < this.listPageSize) {
                        this.threadHasMore = false;
                    } else {
                        this.threadPage += 1;
                    }

                    if (this.threads.length > 0 && !this.selectedThread) {
                        this.selectThread(this.threads[0]);
                    }
                },
                error: () => {
                    this.threadHasMore = false;
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

        // 重設訊息分頁狀態
        this.room = null;
        this.messages = [];
        this.msgPage = 1;
        this.msgHasMore = true;

        this.loadMessages(thread.threadId);
    }

    /**
     * 取得聊天室訊息內容
     * @param threadId
     */
    loadMessages(threadId: string, append = false): void {
        if (this.loadingMessages) return;
        if (!append && !this.msgHasMore) return;

        this.loadingMessages = true;

        const req: CHAT003Req = {
            MWHEADER: { MSGID: 'CHAT-003' },
            TRANRQ: {
                threadId,
                pageSize: this.msgPageSize,
                pageNumber: this.msgPage
            }
        };

        this.chatService.onGetMessageApi(req)
            .pipe(finalize(() => (this.loadingMessages = false)), takeUntil(this.destroy$))
            .subscribe({
                next: (res: CHAT003Res) => {
                    this.room = res.TRANRS.room;

                    // 由舊到新
                    const pageMsgs = (res.TRANRS.messages ?? [])
                        .map(m => this.mapApiMsgToChatMessage(m, threadId))
                        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); // 舊 → 新

                    if (!append) {
                        // 初次
                        this.messages = pageMsgs;
                        this.msgPage = 2; // 下一次會取第 2 頁
                        this.msgHasMore = pageMsgs.length === this.msgPageSize;
                        this.scrollToBottom();
                    } else {
                        const el = this.messagesBox?.nativeElement;
                        const prevHeight = el ? el.scrollHeight : 0;

                        const existing = new Set(this.messages.map(m => m.id));
                        const uniqueOlder = pageMsgs.filter(m => !existing.has(m.id));

                        this.messages = [...uniqueOlder, ...this.messages];

                        if (pageMsgs.length < this.msgPageSize) {
                            this.msgHasMore = false;
                        } else {
                            this.msgPage += 1;
                        }

                        // 維持視窗位置
                        requestAnimationFrame(() => {
                            if (!el) return;
                            const newHeight = el.scrollHeight;
                            el.scrollTop = newHeight - prevHeight + el.scrollTop;
                        });
                    }
                },
                error: () => {
                    this.msgHasMore = false;
                }
            });
    }

    onMessagesScroll(): void {
        if (this.loadingOlder || !this.msgHasMore) return;
        const el = this.messagesBox?.nativeElement;
        if (!el) return;

        if (el.scrollTop <= 30) {
            this.loadingOlder = true;
            this.loadMessages(this.selectedThread!.threadId, true);
            setTimeout(() => (this.loadingOlder = false), 200);
        }
    }

    /** 是否接近底部 */
    private isNearBottom(el: HTMLElement, threshold = 80): boolean {
        return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    }

    private mapApiMsgToChatMessage(m: Message, threadId: string): ChatMessage {
        return {
            id: m.messageId,
            threadId,
            senderAccountId: m.senderId,
            type: m.type,
            content: m.content ?? '',
            createdAt: m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt),
        };
    }

    private bumpThreadToTop(threadId: string, lastMessage: string, time: Date): void {
        const idx = this.threads.findIndex(t => t.threadId === threadId);
        if (idx === -1) return;

        const item = this.threads[idx];
        item.lastMessage = lastMessage as any;
        item.lastMessageTime = time.toISOString() as any;

        this.threads.splice(idx, 1);
        this.threads = [item, ...this.threads];
    }

    onSend(): void {
        const threadId = this.selectedThread?.threadId;
        const content = (this.draft ?? '').trim();
        if (!threadId || !content) return;

        this.ws.sendMessage(threadId, content, 'TEXT');
        this.draft = '';

        this.bumpThreadToTop(threadId, content, new Date());
        this.scrollToBottom();
    }

    onEnterKey(event: any): void {
        if (event.ctrlKey) {
            event.preventDefault();
            this.onSend();
        }
    }


    /**
     * 判斷是誰的訊息
     * @param msg
     * @returns
     */
    isMine(msg: ChatMessage): boolean {
        if (!this.room) return false;
        if (this.room.role === 'user') {
            return msg.senderAccountId === this.room.buyerAccountId;
        }
        if (this.room.role === 'seller') {
            return msg.senderAccountId === this.room.sellerAccountId;
        }
        return false;
    }

    /**
     * 時間格式化
     * @param dt
     * @returns
     */
    formatTime(dt: Date | string): string {
        const d = new Date(dt);
        if (Number.isNaN(d.getTime())) return '';

        // const yy = d.getFullYear();
        const mm = (d.getMonth() + 1).toString().padStart(2, '0');
        const dd = d.getDate().toString().padStart(2, '0');
        const hh = d.getHours().toString().padStart(2, '0');
        const min = d.getMinutes().toString().padStart(2, '0');

        return `${mm}-${dd} ${hh}:${min}`;
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

    getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | null {
        switch (status) {
            case '已完成': return 'success';
            case '已付款': return 'info';
            case '未付款': return 'warn';
            case '已取消': return 'danger';
            default: return null;
        }
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

    trackByMsg(_: number, m: ChatMessage): string {
        return m.id;
    }

    /**
     * 初始化
     */
    ngOnInit(): void {
        this.getThreads();

        this.ws.connect();

        this.ws.messages$
            .pipe(
                takeUntil(this.destroy$),
                filter(m => !!this.selectedThread&& m.threadId === this.selectedThread.threadId)
            )
            .subscribe(m => {
                if (!this.messages.find(x => x.id === m.id)) {
                    const el = this.messagesBox?.nativeElement;
                    const shouldStick = el ? this.isNearBottom(el) : true;

                    this.messages = [...this.messages, m];

                    if (shouldStick) this.scrollToBottom();
                }
            });

        this.ws.threadUpdates$
            .pipe(takeUntil(this.destroy$))
            .subscribe(ev => {
                this.bumpThreadToTop(ev.threadId, ev.lastMessage, ev.lastMessageTime);
            });
    }

    /**
     * 取消訂閱
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
