import { Injectable, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
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
import { HttpWithRetry } from './http-with-retry.service';

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
    private consecutiveErrorCount = 0;
    private maxConsecutiveErrors = 3; // 連續失敗 3 次後停止重連
    private currentToken: string | null = null; // 記錄當前使用的 token

    /** SSE 連線狀態 */
    private sseConnectedSubject = new BehaviorSubject<boolean>(false);
    public readonly sseConnected$ = this.sseConnectedSubject.asObservable();

    /** 防抖機制相關變量 */
    private reconnectTimeout: any = null;
    private isReconnecting = false;
    private currentNotificationCallback?: (notification: NotificationDto) => void;

    constructor(
        private http: HttpWithRetry,
        private authService: Auth
    ) {
        // ✅ 訂閱 token 刷新事件，自動處理 SSE 重連
        this.authService.tokenRefreshed$.subscribe(newToken => {
            this.handleTokenRefresh(newToken);
        });
    }

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

        return this.http.post<NOTIFY003Res>(this.markReadUrl, postData, {
            headers: this.headers,
            withCredentials: true
        }).pipe(
            tap(() => {
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
        // 保存回調函數，用於重連時使用
        if (onNotification) {
            this.currentNotificationCallback = onNotification;
        }

        // ✅ 如果正在重連中，忽略重複請求
        if (this.isReconnecting) {
            return;
        }

        // 取得 access token
        const token = this.authService.getAccessToken();
        if (!token) {
            this.sseConnectedSubject.next(false);
            return;
        }

        // ✅ 如果已有有效連線，不重複建立
        if (this.eventSource &&
            this.eventSource.readyState !== EventSource.CLOSED) {
            return;
        }

        // 檢查連續錯誤次數
        if (this.consecutiveErrorCount >= this.maxConsecutiveErrors) {
            this.sseConnectedSubject.next(false);
            return;
        }

        // ✅ 如果已有連線但需要重新建立，先關閉
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        // 正常建立連線
        this.establishConnection(token, this.currentNotificationCallback);
    }

    /**
     * 實際建立 SSE 連線的私有方法
     * @param token access token
     * @param onNotification 收到通知時的回調函數
     */
    private establishConnection(token: string, onNotification?: (notification: NotificationDto) => void): void {
        // 記錄當前使用的 token
        this.currentToken = token;

        try {
            // 建立新連線
            // 注意：EventSource 不支援自訂 headers，所以將 token 作為 query parameter 傳遞
            // 後端的 NotificationController 支援透過 ?token=xxx 進行認證
            const urlWithToken = `${this.subscribeUrl}?token=${encodeURIComponent(token)}`;

            this.eventSource = new EventSource(urlWithToken, {
                withCredentials: true
            });

            // 監聽通知事件
            this.eventSource.addEventListener('notification', (event: MessageEvent) => {
                try {
                    const notification: NotificationDto = JSON.parse(event.data);

                    // 【重要】使用通知的 created_at 時間，而非本地時間
                    this.lastEventTime = notification.created_at || new Date().toISOString();

                    // 觸發回調
                    if (onNotification) {
                        onNotification(notification);
                    }

                    // 增加未讀數量
                    const currentCount = this.unreadCountSubject.value;
                    this.unreadCountSubject.next(currentCount + 1);
                } catch {
                }
            });

            // 監聽心跳事件
            this.eventSource.addEventListener('heartbeat', () => {
            });

            // 監聽連線開啟（包括首次連線和重連成功）
            this.eventSource.onopen = () => {
                // 連線成功，重置錯誤計數
                this.consecutiveErrorCount = 0;

                if (this.reconnectCount === 0) {
                    // 首次連線
                } else {
                    // 重連成功
                    // 【重要】重連後補發錯過的通知
                    if (this.lastEventTime) {
                        this.resendMissedEvents(this.lastEventTime).subscribe({
                            next: (res) => {
                                if (res.MWHEADER.RETURNCODE === '0000') {
                                }
                            },
                            error: (err) => {}
                        });
                    }
                }

                this.reconnectCount++;
                this.sseConnectedSubject.next(true);
            };

            // 處理連線錯誤（瀏覽器會自動重連）
            this.eventSource.onerror = (error: Event) => {
                // 增加連續錯誤計數
                this.consecutiveErrorCount++;

                if (this.eventSource?.readyState === EventSource.CLOSED) {
                    // 連線已永久關閉
                    this.sseConnectedSubject.next(false);
                } else if (this.consecutiveErrorCount >= this.maxConsecutiveErrors) {
                    // 連續錯誤次數過多，強制關閉連線
                    this.disconnectSSE();
                } else {
                    // 連線斷開，瀏覽器會自動重連（後端設定 retry: 3000）
                    this.sseConnectedSubject.next(false);
                }
            };
        } catch (error) {
            this.sseConnectedSubject.next(false);
        }
    }

    /**
     * 處理 Token 刷新時的 SSE 重連
     * @param newToken 新的 access token
     */
    private handleTokenRefresh(newToken: string): void {
        // 只有在 SSE 連線存在時才需要重連
        if (!this.eventSource) {
            return;
        }

        this.isReconnecting = true;

        // 清除可能存在的舊 timeout
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        // 關閉舊連線
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        // 延遲重連，確保舊連線完全關閉
        this.reconnectTimeout = setTimeout(() => {
            this.isReconnecting = false;
            this.establishConnection(newToken, this.currentNotificationCallback);
        }, 500);
    }

    /**
     * 關閉 SSE 連線
     */
    disconnectSSE(): void {
        // ✅ 清除重連 timeout
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        // 關閉連線
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        // 重置狀態
        this.sseConnectedSubject.next(false);
        this.reconnectCount = 0;
        this.currentToken = null;
        this.isReconnecting = false;  // ✅ 重置重連標誌
        // 注意：不重置 consecutiveErrorCount，讓它在下次 connectSSE 時檢查
    }

    /**
     * 重置重連計數器（手動重連時使用）
     */
    resetReconnectCount(): void {
        this.reconnectCount = 0;
        this.consecutiveErrorCount = 0;
        this.isReconnecting = false;  // ✅ 重置重連標誌
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
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
