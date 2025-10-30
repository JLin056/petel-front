export interface MEDIA003Res {
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
    status: string;
    errorMessage: string | null;
}
