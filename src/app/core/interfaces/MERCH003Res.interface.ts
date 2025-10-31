export interface MERCH003Tranrs {
    avgPriceScore: number;
    avgEnvScore: number;
    avgServiceScore: number;
    reviews: reviewList[];
    currentPage: number;
    totalPage: number;
    totalCount: number;
}

export interface reviewList {
    orderId: string;
    userName: string;
    priceScore: number;
    envScore: number;
    serviceScore: number;
    avgScore: number;
    content: string;
    createdAt: string;
}