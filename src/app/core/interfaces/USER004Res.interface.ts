export interface USER004Res {
    MWHEADER: Mwheader;
    TRANRS:   Tranrs;
}

export interface Mwheader {
    RETURNCODE: string;
    RETURNDESC: string;
}

export interface Tranrs {
    id:        string;
    accountId: string;
    name:      string;
    phone:     string;
    email:     string;
    mediaId:   string;
}