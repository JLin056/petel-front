import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class TestWebsocket {
    private client: Client;
    private connected = false;

    constructor() {
        this.client = new Client({
            brokerURL: 'ws://localhost:8080/ws-native',
            reconnectDelay: 3000,

            beforeConnect: () => {
            },

            debug: (msg) => console.log('[STOMP]', msg),

            onConnect: () => {
                this.connected = true;
                console.log('✅ STOMP 連線成功 (native)');
            },

            onStompError: (frame) => {
                console.error('❌ STOMP 錯誤', frame.headers['message'], frame.body);
            }
        });

        this.client.webSocketFactory = () => {
            const ws = new WebSocket("ws://localhost:8080/ws-native");
            return ws;
        };
    }

    connect(): void {
        if (!this.connected) {
            console.log('[WS] 嘗試建立連線...');
            this.client.activate();
        } else {
            console.log('[WS] 已連線中');
        }
    }

    disconnect(): void {
        if (this.connected) {
            this.client.deactivate();
            this.connected = false;
            console.log('[WS] 已斷開連線');
        }
    }

    subscribeToRoom(threadId: string, callback: (msg: IMessage) => void): void {
        if (!this.connected) {
            console.warn('⚠️ 尚未連線，無法訂閱');
            return;
        }
        const destination = `/topic/room.${threadId}`;
        this.client.subscribe(destination, callback);
        console.log(`🟢 已訂閱: ${destination}`);
    }

    sendMessage(threadId: string, payload: any): void {
        if (!this.connected) {
            console.warn('⚠️ 尚未連線');
            return;
        }
        this.client.publish({
            destination: `/app/rooms/${threadId}/send`,
            body: JSON.stringify(payload),
            headers: { 'content-type': 'application/json' }
        });
        console.log('📤 已發送:', payload);
    }
}
