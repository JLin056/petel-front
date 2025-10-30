export interface CHAT001Res {
    MWHEADER: Mwheader;
    TRANRS:   Tranrs;
}

export interface Mwheader {
    RETURNCODE: string;
    RETURNDESC: string;
}

export interface Tranrs {
    threadId: string;
    orderId:  string;
    userId:   string;
    sellerId: string;
    status:   string;
    topic:    string;
}
