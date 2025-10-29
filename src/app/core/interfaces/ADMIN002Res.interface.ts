export interface Seller {
  SELLER_ID: string;
  ACCOUNT_ID: string;
  EMAIL: string;
  NAME: string;
  BUSINESS_CODE: string;
  ROLE: string;
  STATUS: string;
}

export interface ADMIN002ReqTRANRQ {
  Account_Id?: string;
  Name?: string;
  Email?: string;
  Phone?: string;
  page: {
    pageNumber: number;
    pageSize: number;
  };
}

export interface ADMIN002Req {
  MWHEADER: {
    MSGID: string;
  };
  TRANRQ: ADMIN002ReqTRANRQ;
}

export interface ADMIN002ResTRANRS {
  sellers: Seller[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface ADMIN002Res {
  MWHEADER: {
    RETURNCODE: string;
    RETURNDESC: string;
  };
  TRANRS: ADMIN002ResTRANRS;
}

export interface SellerStatus {
  label: string;
  value: string;
}
