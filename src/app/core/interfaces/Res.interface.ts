export interface Res<T> {
    MWHEADER: Mwheader;
    TRANRS: T;
}

export interface Mwheader {
    RETURNCODE: string;
    RETURNDESC: string;
}
