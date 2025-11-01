export interface Order {
  ORDER_ID: string;
  STAY_DATE?: string;
  CHECK_IN: string;
  CHECK_OUT: string;
  USER_NAME: string;
  USER_PHONE: string;
  FINAL_USER_NAME?: string;
  FINAL_USER_Phone?: string;
  PROPERTY_NAME: string | null;
  PROPERTY_PHONE: string | null;
  ROOM: string | null;
  room?: string | null;  // 備用：如果後端回傳小寫
  QUANTITY?: number;
  quantity?: number;  // 備用：如果後端回傳小寫
  HOTEL_CHARGES: number;
  PRICE_EVERYNIGHT?: number;
  STATUS: string;
  NOTE: string | null;
  CREATED_AT: string;
  UPDATED_AT: string | null;
  PAYMENT_METHOD?: string;
}

export interface Status {
  label: string;
  value: string;
}

export interface ADMIN003Res {
  MWHEADER: {
    RETURNCODE: string;
    RETURNDESC: string;
  };
  TRANRS: {
    orders: Order[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
}