export interface ADMIN003Req {
  MWHEADER: {
    MSGID: string;
  };
  TRANRQ: {
    ORDER_ID?: string;
    CHECK_IN?: string;
    userName?: string;
    userPhone?: string;
    propertyName?: string;
    propertyPhone?: string;
    page: {
      pageNumber: number;
      pageSize: number;
    };
  };
}
