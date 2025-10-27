export interface BOOK001Tranrq {
    order_info:   OrderInfo;
    order_detail: OrderDetail[];
}

export interface OrderDetail {
    room_id:       string;
    arrival_date:  string;
    room_quantity: number;
    room_price:    number;
}

export interface OrderInfo {
    // user_id:     string;
    property_id: string;
    payment_id:  string;
    check_in:    string;
    check_out:   string;
    status:      string;
    guest:       string;
    guest_name:  string | null;
    guest_phone: string | null;
    note:        string | null;
}
