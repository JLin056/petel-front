export interface MEDIA003Req {
    MWHEADER: Mwheader;
    TRANRQ: Tranrq;
}

export interface Mwheader {
    MSGID: string;
}

export interface Tranrq {
    mediaIds: string[];
}
