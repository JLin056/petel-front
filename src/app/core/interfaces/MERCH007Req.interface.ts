// export interface MERCH007Tranrq {
//     name: string;
//     tel: string;
//     address: string;
//     bankAccount: string;
//     info: string;
//     checkNotice: string;
//     petNotice: string;
//     propertyNotice: string;
// }

// export interface Welcome {
//     MWHEADER: Mwheader;
//     TRANRQ:   Tranrq;
// }

// export interface Mwheader {
//     MSGID: string;
// }

export interface MERCH007Tranrq {
    id:             string | undefined;
    tel:            string | undefined;
    city:           string | undefined;
    district:       string | undefined;
    addressDetail:  string | undefined;
    bankAccount:    string | undefined;
    info:           string | undefined;
    checkNotice:    string | undefined;
    petNotice:      string | undefined;
    propertyNotice: string | undefined;
    facilities:     string[] | undefined;
    propertyImages: MERCH007TranrqPropertyImage[];
}

export interface MERCH007TranrqPropertyImage {
    mediaId:        string;
    sortOrder:      number | undefined;
}
