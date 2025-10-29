export interface ADMIN004ReqTRANRQ {
  orderId: string;
  note: string;
}

export interface ADMIN004Req {
  MWHEADER: {
    MSGID: string;
  };
  TRANRQ: ADMIN004ReqTRANRQ;
}
