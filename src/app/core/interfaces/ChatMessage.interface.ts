export interface ChatMessage {
    id: string;
    threadId:  string;
    senderAccountId: string;
    type:      string;
    content:   string;
    createdAt: Date;
}
