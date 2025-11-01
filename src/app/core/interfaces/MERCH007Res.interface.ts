// export interface MERCH007Tranrs {
// }

// export interface Welcome {
//     MWHEADER: Mwheader;
//     TRANRS:   Tranrs;
// }

// export interface Mwheader {
//     RETURNCODE: string;
//     RETURNDESC: string;
// }

export interface MERCH007Tranrs {
    id:             string;
    name:           string;
    businessCode:   string;
    tel:            string;
    address:        string;
    bankAccount:    string;
    info:           string;
    checkNotice:    string;
    petNotice:      string;
    propertyNotice: string;
    facilities:     string[];
}
