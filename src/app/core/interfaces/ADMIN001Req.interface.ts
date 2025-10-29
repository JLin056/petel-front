export interface ADMIN001Req {
  MWHEADER: {
    MSGID: string;
  };
  TRANRQ: {
    propertyId?: string;
    propertyName?: string;
    tel?: string;
    postalCode?: string;
    address?: string;
    sellerName?: string;
    page: {
      pageNumber: number;
      pageSize: number;
    };
  };
}