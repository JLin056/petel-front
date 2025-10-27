export interface ADMIN007Res {
  MWHEADER: {
    RETURNCODE: string;
    RETURNDESC: string;
  };
  TRANRS: {
    members: Member[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface Member {
  USER_ID: string;
  ACCOUNT_ID: string;
  EMAIL: string;
  NAME: string;
  PHONE: string;
  ROLE: string;
  STATUS: string;
}
