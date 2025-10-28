export interface BOOK005Tranrq {
    order_id: string;
    card_info: BOOK005TranrqCardInfo;
    consumer_info: BOOK005TranrqConsumerInfo;
}

export interface BOOK005TranrqCardInfo {
    card_no: string;
    card_valid_mm: string;
    card_valid_yy: string;
    card_cvv_2: string;
}

export interface BOOK005TranrqConsumerInfo {
    phone: string;
    name: string;
}
