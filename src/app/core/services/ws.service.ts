import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Auth } from './auth.service';
import { catchError, firstValueFrom, of, Subject } from 'rxjs';
import { ChatMessage } from '../interfaces/ChatMessage.interface';

@Injectable({
  providedIn: 'root'
})
export class WsService {

    private client: Client;
    private connected = false;
    private reconnecting = false;

    private incoming$ = new Subject<ChatMessage>();
    public readonly messages$ = this.incoming$.asObservable();

    constructor(private authService: Auth) {
        this.client = this.createClient();
    }


    private createClient(): Client {
        const client = new Client({
            brokerURL: 'ws://localhost:8080/ws-native',
            reconnectDelay: 8000,

            debug: (msg) => console.log('[STOMP]', msg),

            onConnect: () => {
                this.connected = true;
                console.log('✅ WebSocket 已連線');

                client.subscribe('/user/queue/chat', (msg: IMessage) => {
                    try {
                        const raw = JSON.parse(msg.body);
                        const data: ChatMessage = {
                            id: raw.id,
                            threadId: raw.threadId,
                            senderAccountId: raw.senderAccountId,
                            type: raw.type,
                            content: raw.content ?? '',
                            createdAt: new Date(raw.createdAt)
                        };
                        this.incoming$.next(data);
                    } catch {
                        console.warn('[WS] 無法解析訊息：', msg.body);
                    }
                });
            },

            onStompError: (frame) => {
                console.error('❌ STOMP 錯誤', frame.headers['message'], frame.body);
            },

            onWebSocketClose: () => {
                this.connected = false;
                console.warn('⚠️ WS 已關閉');
                this.tryRefreshAndReconnect();
            },
        });

        return client;
    }

    /** 啟動連線 */
    async connect(): Promise<void> {
        if (this.connected) return;

        let token = this.authService.getAccessToken();
        if (!token) {
            await firstValueFrom(
                this.authService.onRefreshToken().pipe(catchError(() => of(null)))
            );
            token = this.authService.getAccessToken();
        }

        if (!token) {
            console.warn('[WS] 無法取得 access token，略過連線');
            return;
        }

        this.client.connectHeaders = {
            Authorization: `Bearer ${token}`
        };

        console.log('[WS] 嘗試建立連線...');
        this.client.activate();
    }

    /** 發送訊息 */
    sendMessage(threadId: string, content: string, type = 'TEXT'): void {
        if (!this.connected) {
            console.warn('❗ 尚未連線，請先呼叫 connect()');
            return;
        }
        const body = JSON.stringify({ content: (content ?? '').trim(), type });
        if (!JSON.parse(body).content) return;

        const token = this.authService.getAccessToken();

        this.client.publish({
            destination: `/app/rooms/${threadId}/send`,
            headers: { Authorization: `Bearer ${token}`},
            body
        });

        console.log('➡️ 已送出訊息', { threadId, body });
    }

    disconnect(): void {
        this.client.deactivate();
        this.connected = false;
        console.log('[WS] 已中斷連線');
    }

    private async tryRefreshAndReconnect(): Promise<void> {
        if (this.reconnecting) return;
        this.reconnecting = true;
        try {
            console.log('[WS] 嘗試 refresh token 並重新連線...');
            await firstValueFrom(
                this.authService.onRefreshToken().pipe(catchError(() => of(null)))
            );

            const newToken = this.authService.getAccessToken();
            if (newToken) {
                console.log('[WS] Refresh 成功，重新建立連線');
                this.client = this.createClient();
                this.client.connectHeaders = {
                    Authorization: `Bearer ${newToken}`
                };
                this.client.activate();
            } else {
                console.warn('[WS] refresh 後仍無 token，停止重連');
            }
        } finally {
            this.reconnecting = false;
        }
    }
}
