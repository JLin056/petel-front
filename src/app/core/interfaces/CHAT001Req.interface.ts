export interface CHAT001Req {
    MWHEADER: Mwheader;
    TRANRQ: Tranrq;
}

export interface Mwheader {
    MSGID: string;
}

export interface Tranrq {
    orderId: string;
}
