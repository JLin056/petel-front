export interface USER001Req {
    MWHEADER: Mwheader;
    TRANRQ:   Tranrq;
}

export interface Mwheader {
    MSGID: string;
}

export interface Tranrq {
    name:    string;
    phone:   string;
    mediaId: string;
}
