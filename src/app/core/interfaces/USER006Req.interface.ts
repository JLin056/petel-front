export interface USER006Req {
    MWHEADER: Mwheader;
    TRANRQ:   Tranrq;
}

export interface Mwheader {
    MSGID: string;
}

export interface Tranrq {
    status?:   string;
    sortMode?: string;
    from?:     Date;
    to?:       Date;
    page?:     number;
    pageSize?: number;
}
