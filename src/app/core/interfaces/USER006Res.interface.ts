export interface USER006Res {
    MWHEADER: Mwheader;
    TRANRS:   Tranrs;
}

export interface Mwheader {
    RETURNCODE: string;
    RETURNDESC: string;
}

export interface Tranrs {
    orders:      Order[];
    totalCount:  number;
    totalPages:  number;
    currentPage: number;
}

export interface Order {
    orderId:      string;
    propertyName: string;
    checkIn:      Date;
    checkOut:     Date;
    status:       string;
    totalPrice:   number;
    propertyAvg:  number;
    imageUrl:     null | string;
    hasReview:    boolean;
}
