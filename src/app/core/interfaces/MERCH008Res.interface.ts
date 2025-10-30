import { Mwheader } from './Res.interface';

export interface MERCH008Tranrs {
    id: string;
    sellerId: string;
    name: string;
    businessCode: string;
    tel: string;
    address: string;
    bankAccount: string;
    info: string;
    checkNotice: string;
    petNotice: string;
    propertyNotice?: string;
    facilities?: string[];
}

export interface MERCH008Res {
    MWHEADER: Mwheader;
    TRANRS: MERCH008Tranrs;
}
