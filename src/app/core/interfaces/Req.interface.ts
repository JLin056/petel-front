export interface Req<T> {
    MWHEADER: Mwheader;
    TRANRQ: T;
}

export interface Mwheader {
    MSGID: string;
}
