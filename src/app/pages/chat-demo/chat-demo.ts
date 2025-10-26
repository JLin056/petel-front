import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IMessage } from '@stomp/stompjs';
import { TestWebsocket } from '../../core/services/test-websocket';


@Component({
  selector: 'app-chat-demo',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-demo.html',
  styleUrl: './chat-demo.css'
})
export class ChatDemo {
    threadId = 'T000000001';
    message = 'Hello';
    logs: string[] = [];
    private joined = false;

    constructor(private ws: TestWebsocket) {}

    connect() {
        this.ws.connect();
        this.logs.push('➡️ 呼叫 connect()');
    }

    join() {
        if (this.joined) {
            this.logs.push('已訂閱，略過');
            return;
        }
        this.ws.subscribeToRoom(this.threadId, (msg: IMessage) => {
            this.logs.push('📥 RECV: ' + msg.body);
        });

        this.joined = true;
        this.logs.push(`🟢 Subscribed /topic/room.${this.threadId}`);
    }

    send() {
        const payload = {
            type: 'TEXT',
            content: this.message
        };
        this.ws.sendMessage(this.threadId, payload);
        this.logs.push('📤 SEND: ' + JSON.stringify(payload));
    }

    disconnect() {
        this.ws.disconnect();
        this.logs.push('⛔ Disconnect');
        this.joined = false;
    }

    ngOnDestroy() {
        this.ws.disconnect();
    }
}
