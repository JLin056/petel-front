export interface MERCH008Tranrq {
    sellerId: string;
    name: string;
    tel: string;
    businessCode: string;
    city: string;
    district: string;
    addressDetail: string;
    bankAccount: string;
    info: string;
    checkNotice: string;
    petNotice: string;
    propertyNotice?: string;
    facilities?: string[];
    propertyImages?: MERCH008TranrqPropertyImage[];
}

export interface MERCH008TranrqPropertyImage {
    mediaId: string;
    sortOrder?: number;
}
