export interface MERCH007Tranrq {
    id?:             string;
    tel?:            string;
    city?:           string;
    district?:       string;
    addressDetail?:  string;
    bankAccount?:    string;
    info?:           string;
    checkNotice?:    string;
    petNotice?:      string;
    propertyNotice?: string;
    facilities?:     string[];
    propertyImages: MERCH007TranrqPropertyImage[];
}

export interface MERCH007TranrqPropertyImage {
    mediaId:        string;
    sortOrder?:      number;
}
