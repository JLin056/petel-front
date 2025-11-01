import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environment';
import { NOTIFY002Res } from '../interfaces/NOTIFY002Res.interface';
import { NOTIFY003Req } from '../interfaces/NOTIFY003Req.interface';
import { NOTIFY003Res } from '../interfaces/NOTIFY003Res.interface';
import { NOTIFY004Res } from '../interfaces/NOTIFY004Res.interface';
import { NOTIFY006Req } from '../interfaces/NOTIFY006Req.interface';
import { NOTIFY006Res } from '../interfaces/NOTIFY006Res.interface';
import { NotificationDto } from '../interfaces/notification.interface';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    /** Base URL */
    private readonly baseUrl = `${environment.BASE_URL}/notifications`;

    /** API URLs */
    private readonly listUrl = `${this.baseUrl}/list`;
    private readonly markReadUrl = `${this.baseUrl}/mark-read`;
    private readonly unreadCountUrl = `${this.baseUrl}/unread-count`;
    private readonly subscribeUrl = `${this.baseUrl}/subscribe`;
    private readonly resendMissedUrl = `${this.baseUrl}/resend-missed`;

    /** headers */
    private readonly headers = new HttpHeaders({
        'Content-Type': 'application/json'
    });

    /** 未讀數量狀態 */
    private unreadCountSubject = new BehaviorSubject<number>(0);
    public readonly unreadCount$ = this.unreadCountSubject.asObservable();

    /** SSE 連線 */
    private eventSource: EventSource | null = null;
    private lastEventTime: string | null = null;
    private reconnectAttempts = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 5;
    private reconnectTimer: any = null;

    /** SSE 連線狀態 */
    private sseConnectedSubject = new BehaviorSubject<boolean>(false);
    public readonly sseConnected$ = this.sseConnectedSubject.asObservable();

    constructor(private http: HttpClient) { }

    /**
     * NOTIFY-002: 查詢通知列表
     * @returns Observable<NOTIFY002Res>
     */
    getNotificationList(): Observable<NOTIFY002Res> {
        return this.http.get<NOTIFY002Res>(this.listUrl, {
            withCredentials: true
        });
    }

    /**
     * NOTIFY-003: 標記通知為已讀
     * @param notificationId 通知 ID
     * @returns Observable<NOTIFY003Res>
     */
    markAsRead(notificationId: string): Observable<NOTIFY003Res> {
        const postData: NOTIFY003Req = {
            MWHEADER: { MSGID: 'NOTIFY-003' },
            TRANRQ: { notification_id: notificationId }
        };

        console.log('=== NotificationService.markAsRead ===');
        console.log('URL:', this.markReadUrl);
        console.log('請求資料:', JSON.stringify(postData, null, 2));
        console.log('Headers:', this.headers);

        return this.http.post<NOTIFY003Res>(this.markReadUrl, postData, {
            headers: this.headers,
            withCredentials: true
        }).pipe(
            tap((res) => {
                console.log('標記已讀成功，回應:', res);
                // 標記已讀後，減少未讀數量
                const currentCount = this.unreadCountSubject.value;
                if (currentCount > 0) {
                    this.unreadCountSubject.next(currentCount - 1);
                }
            })
        );
    }

    /**
     * NOTIFY-004: 取得未讀通知數量
     * @returns Observable<NOTIFY004Res>
     */
    getUnreadCount(): Observable<NOTIFY004Res> {
        return this.http.get<NOTIFY004Res>(this.unreadCountUrl, {
            withCredentials: true
        }).pipe(
            tap(res => {
                if (res.MWHEADER.RETURNCODE === '0000') {
                    this.unreadCountSubject.next(res.TRANRS.unread_count);
                }
            })
        );
    }

    /**
     * NOTIFY-006: 補發錯過的事件
     * @param lastEventTime 上次收到事件的時間
     * @returns Observable<NOTIFY006Res>
     */
    resendMissedEvents(lastEventTime: string): Observable<NOTIFY006Res> {
        const postData: NOTIFY006Req = {
            MWHEADER: { MSGID: 'NOTIFY-006' },
            TRANRQ: { last_event_time: lastEventTime }
        };

        return this.http.post<NOTIFY006Res>(this.resendMissedUrl, postData, {
            headers: this.headers,
            withCredentials: true
        });
    }

    /**
     * NOTIFY-005: 建立 SSE 連線（即時推播）- 帶自動重連
     * @param onNotification 收到通知時的回調函數
     */
    connectSSE(onNotification?: (notification: NotificationDto) => void): void {
        console.log('=== 建立 SSE 連線 ===');

        // 如果已有連線，先關閉
        if (this.eventSource) {
            this.eventSource.close();
        }

        // 清除重連 timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        try {
            // 建立新連線（注意：EventSource 不支援自訂 headers，需要透過 cookie 傳遞認證）
            this.eventSource = new EventSource(this.subscribeUrl, {
                withCredentials: true
            });

            // 監聽通知事件
            this.eventSource.addEventListener('notification', (event: MessageEvent) => {
                try {
                    console.log('收到新通知 SSE 事件:', event.data);
                    const notification: NotificationDto = JSON.parse(event.data);
                    this.lastEventTime = new Date().toISOString();

                    // 觸發回調
                    if (onNotification) {
                        onNotification(notification);
                    }

                    // 增加未讀數量
                    const currentCount = this.unreadCountSubject.value;
                    this.unreadCountSubject.next(currentCount + 1);

                    console.log('未讀數量已更新:', currentCount + 1);
                } catch (error) {
                    console.error('解析通知資料失敗:', error);
                }
            });

            // 監聽心跳事件
            this.eventSource.addEventListener('heartbeat', (event: MessageEvent) => {
                console.log('SSE 心跳:', event.data);
            });

            // 處理連線錯誤
            this.eventSource.onerror = (error: Event) => {
                console.error('SSE 連線錯誤:', error);
                this.sseConnectedSubject.next(false);
                this.eventSource?.close();
                this.eventSource = null;

                // 自動重連
                this.attemptReconnect(onNotification);
            };

            // 監聽連線開啟
            this.eventSource.onopen = () => {
                console.log('✅ SSE 連線已建立');
                this.reconnectAttempts = 0;
                this.sseConnectedSubject.next(true);

                // 如果有上次的事件時間，補發錯過的通知
                if (this.lastEventTime) {
                    console.log('補發錯過的通知，上次時間:', this.lastEventTime);
                    this.resendMissedEvents(this.lastEventTime).subscribe({
                        next: (res) => {
                            if (res.MWHEADER.RETURNCODE === '0000') {
                                console.log(`補發了 ${res.TRANRS.resent_count} 個錯過的通知`);
                            }
                        },
                        error: (err) => console.error('補發通知失敗:', err)
                    });
                }
            };
        } catch (error) {
            console.error('建立 SSE 連線失敗:', error);
            this.sseConnectedSubject.next(false);
            this.attemptReconnect(onNotification);
        }
    }

    /**
     * 嘗試重新連線
     */
    private attemptReconnect(onNotification?: (notification: NotificationDto) => void): void {
        if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
            console.error('❌ SSE 重連次數已達上限，停止重連');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000); // 指數退避，最多 30 秒

        console.log(`⏳ 將在 ${delay / 1000} 秒後嘗試第 ${this.reconnectAttempts} 次重連...`);

        this.reconnectTimer = setTimeout(() => {
            console.log(`🔄 開始第 ${this.reconnectAttempts} 次重連...`);
            this.connectSSE(onNotification);
        }, delay);
    }

    /**
     * 關閉 SSE 連線
     */
    disconnectSSE(): void {
        console.log('關閉 SSE 連線');

        // 清除重連 timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        // 關閉連線
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        // 重置狀態
        this.sseConnectedSubject.next(false);
        this.reconnectAttempts = 0;

        console.log('✅ SSE 連線已關閉');
    }

    /**
     * 重置重連計數器（手動重連時使用）
     */
    resetReconnectAttempts(): void {
        this.reconnectAttempts = 0;
    }

    /**
     * 取得 SSE 連線狀態
     */
    isSSEConnected(): boolean {
        return this.sseConnectedSubject.value;
    }

    /**
     * 取得上次事件時間（用於斷線重連）
     */
    getLastEventTime(): string | null {
        return this.lastEventTime;
    }

    /**
     * 取得當前未讀數量（同步方法）
     */
    getUnreadCountSync(): number {
        return this.unreadCountSubject.value;
    }

    /**
     * 手動設定未讀數量
     */
    setUnreadCount(count: number): void {
        this.unreadCountSubject.next(count);
    }
}
