import { Injectable, inject } from '@angular/core';
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
import { Auth } from './auth.service';

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
    private reconnectCount = 0;

    /** SSE 連線狀態 */
    private sseConnectedSubject = new BehaviorSubject<boolean>(false);
    public readonly sseConnected$ = this.sseConnectedSubject.asObservable();

    constructor(
        private http: HttpClient,
        private authService: Auth
    ) { }

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
     * NOTIFY-005: 建立 SSE 連線（即時推播）
     *
     * 自動重連機制：
     * - 後端已設定 retry: 3000（每 3 秒自動重連）
     * - 瀏覽器的 EventSource API 會自動處理重連
     * - 重連成功後會自動補發錯過的通知
     *
     * 工作流程：
     * 1. 建立 SSE 連線
     * 2. 監聽 'notification' 和 'heartbeat' 事件
     * 3. 更新 lastEventTime（使用通知的 created_at）
     * 4. 斷線時瀏覽器自動重連（無需手動處理）
     * 5. 重連成功後調用 NOTIFY-006 補發錯過的通知
     *
     * @param onNotification 收到通知時的回調函數
     */
    connectSSE(onNotification?: (notification: NotificationDto) => void): void {
        console.log('=== 建立 SSE 連線 ===');

        // 如果已有連線，先關閉
        if (this.eventSource) {
            console.warn('[SSE] 已存在連線，先斷開舊連線');
            this.disconnectSSE();
        }

        // 取得 access token
        const token = this.authService.getAccessToken();
        if (!token) {
            console.error('[SSE] ❌ 無法建立連線：未找到 access token');
            this.sseConnectedSubject.next(false);
            return;
        }

        try {
            // 建立新連線
            // 注意：EventSource 不支援自訂 headers，所以將 token 作為 query parameter 傳遞
            // 後端的 NotificationController 支援透過 ?token=xxx 進行認證
            const urlWithToken = `${this.subscribeUrl}?token=${encodeURIComponent(token)}`;
            console.log('[SSE] 建立連線 URL:', this.subscribeUrl);

            this.eventSource = new EventSource(urlWithToken, {
                withCredentials: true
            });

            // 監聽通知事件
            this.eventSource.addEventListener('notification', (event: MessageEvent) => {
                try {
                    console.log('[SSE] 收到新通知:', event.data);
                    const notification: NotificationDto = JSON.parse(event.data);

                    // 【重要】使用通知的 created_at 時間，而非本地時間
                    this.lastEventTime = notification.created_at || new Date().toISOString();
                    console.log('[SSE] 更新 lastEventTime:', this.lastEventTime);

                    // 觸發回調
                    if (onNotification) {
                        onNotification(notification);
                    }

                    // 增加未讀數量
                    const currentCount = this.unreadCountSubject.value;
                    this.unreadCountSubject.next(currentCount + 1);
                    console.log('[SSE] 未讀數量已更新:', currentCount + 1);
                } catch (error) {
                    console.error('[SSE] 解析通知資料失敗:', error);
                }
            });

            // 監聽心跳事件
            this.eventSource.addEventListener('heartbeat', (event: MessageEvent) => {
                console.log('[SSE] 心跳:', event.data);
            });

            // 監聽連線開啟（包括首次連線和重連成功）
            this.eventSource.onopen = () => {
                if (this.reconnectCount === 0) {
                    // 首次連線
                    console.log('[SSE] ✅ 首次連線成功');
                } else {
                    // 重連成功
                    console.log(`[SSE] ✅ 重連成功（第 ${this.reconnectCount} 次）`);

                    // 【重要】重連後補發錯過的通知
                    if (this.lastEventTime) {
                        console.log('[SSE] 補發錯過的通知，上次時間:', this.lastEventTime);
                        this.resendMissedEvents(this.lastEventTime).subscribe({
                            next: (res) => {
                                if (res.MWHEADER.RETURNCODE === '0000') {
                                    console.log(`[SSE] ✅ 補發了 ${res.TRANRS.resent_count} 個錯過的通知`);
                                }
                            },
                            error: (err) => console.error('[SSE] ❌ 補發通知失敗:', err)
                        });
                    }
                }

                this.reconnectCount++;
                this.sseConnectedSubject.next(true);
            };

            // 處理連線錯誤（瀏覽器會自動重連）
            this.eventSource.onerror = (error: Event) => {
                if (this.eventSource?.readyState === EventSource.CLOSED) {
                    // 連線已永久關閉
                    console.error('[SSE] ❌ 連線已關閉');
                    this.sseConnectedSubject.next(false);
                } else {
                    // 連線斷開，瀏覽器會自動重連（後端設定 retry: 3000）
                    console.warn('[SSE] ⚠️ 連線斷開，3 秒後自動重連...');
                    this.sseConnectedSubject.next(false);
                }
            };
        } catch (error) {
            console.error('[SSE] ❌ 建立連線失敗:', error);
            this.sseConnectedSubject.next(false);
        }
    }

    /**
     * 關閉 SSE 連線
     */
    disconnectSSE(): void {
        console.log('[SSE] 關閉連線');

        // 關閉連線
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        // 重置狀態
        this.sseConnectedSubject.next(false);
        this.reconnectCount = 0;

        console.log('[SSE] ✅ 連線已關閉');
    }

    /**
     * 重置重連計數器（手動重連時使用）
     */
    resetReconnectCount(): void {
        this.reconnectCount = 0;
        console.log('[SSE] 重連計數器已重置');
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
