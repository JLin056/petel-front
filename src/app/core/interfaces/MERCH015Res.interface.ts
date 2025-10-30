import { Mwheader } from './Res.interface';

export interface MERCH015Tranrs {
    id: string;
    city: string;
    district: string;
}

export interface MERCH015Res {
    MWHEADER: Mwheader;
    TRANRS: MERCH015Tranrs[];
}
