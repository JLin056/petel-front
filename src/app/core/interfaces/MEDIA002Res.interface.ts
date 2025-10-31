export interface MEDIA002Res {
    MWHEADER: Mwheader;
    TRANRS: Tranrs;
}

export interface Mwheader {
    RETURNCODE: string;
    RETURNDESC: string;
}

export interface Tranrs {
    successCount: number;
    failedCount: number;
    results: Result[];
}

export interface Result {
    mediaId: string;
    bucket: string;
    fileName: string;
    sizeBytes: number;
    mimeType: string;
    status: string;
    errorMessage: string | null;
}
