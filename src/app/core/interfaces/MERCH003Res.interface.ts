export interface MERCH003Tranrs {
    stats: never[];
    rooms: reviewList[];
}

export interface reviewList {
    orderId: string;
    userName: string;
    priceScore: number;
    envScore: number;
    serviceScore: string;
    avgScore: string;
    content: string;
    createdAt: string
}
