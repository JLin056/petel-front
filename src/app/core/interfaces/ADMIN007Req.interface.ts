export interface ADMIN007Req {
  MWHEADER: {
    MSGID: string;
  };
  TRANRQ: {
    Account_Id?: string;
    Name?: string;
    Email?: string;
    Phone?: string;
    page: {
      pageNumber: number;
      pageSize: number;
    };
  };
}
