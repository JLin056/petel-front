export interface MEDIA002Req {
    MWHEADER: Mwheader;
    TRANRQ: Tranrq;
}

export interface Mwheader {
    MSGID: string;
}

export interface Tranrq {
    medias: MediaInfo[];
}

export interface MediaInfo {
    mediaId: string;
    base64Data?: string;
    fileName?: string;
    mimeType?: string;
    bucket?: string;
    sizeBytes?: number;
    sortOrder?: number;
}
