import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Auth } from './auth.service';
import { catchError, firstValueFrom, of, Subject } from 'rxjs';
import { ChatMessage } from '../interfaces/ChatMessage.interface';
import { ThreadUpdate } from '../interfaces/ThreadUpdate.interface';

@Injectable({
  providedIn: 'root'
})
export class WsService {

    private client: Client;
    private connected = false;
    private reconnecting = false;

    private incoming$ = new Subject<ChatMessage>();
    public readonly messages$ = this.incoming$.asObservable();

    private threadUpdatesSub$ = new Subject<ThreadUpdate>();
    public readonly threadUpdates$ = this.threadUpdatesSub$.asObservable();

    constructor(private authService: Auth) {
        this.client = this.createClient();
    }


    private createClient(): Client {
        const client = new Client({
            brokerURL: 'ws://localhost:8080/ws-native',
            reconnectDelay: 8000,

            onConnect: () => {
                this.connected = true;

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
                    }
                });

                client.subscribe('/user/queue/thread-updates', (msg: IMessage) => {
                    try {
                        const raw = JSON.parse(msg.body);
                        const ev: ThreadUpdate = {
                            threadId: raw.threadId,
                            lastMessage: raw.lastMessage,
                            lastMessageTime: new Date(raw.lastMessageTime),
                            senderId: raw.senderId
                        };
                        this.threadUpdatesSub$.next(ev);
                    } catch (e) {
                    }
                });
            },

            onStompError: (frame) => {
            },

            onWebSocketClose: () => {
                this.connected = false;
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
            return;
        }

        this.client.connectHeaders = {
            Authorization: `Bearer ${token}`
        };

        this.client.activate();
    }

    /** 發送訊息 */
    sendMessage(threadId: string, content: string, type = 'TEXT'): void {
        if (!this.connected) {
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
    }

    disconnect(): void {
        this.client.deactivate();
        this.connected = false;
    }

    private async tryRefreshAndReconnect(): Promise<void> {
        if (this.reconnecting) return;
        this.reconnecting = true;
        try {
            await firstValueFrom(
                this.authService.onRefreshToken().pipe(catchError(() => of(null)))
            );

            const newToken = this.authService.getAccessToken();
            if (newToken) {
                this.client = this.createClient();
                this.client.connectHeaders = {
                    Authorization: `Bearer ${newToken}`
                };
                this.client.activate();
            }
        } finally {
            this.reconnecting = false;
        }
    }
}
