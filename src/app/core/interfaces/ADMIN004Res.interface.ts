export interface Member {
  ACCOUNT_ID: string;
  EMAIL: string;
  NAME: string;
  PHONE: string;
  ROLE: string;
  STATUS: string;
}

export interface ADMIN004ResTRANRS {
  members: Member[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface ADMIN004Res {
  MWHEADER: {
    RETURNCODE: string;
    RETURNDESC: string;
  };
  TRANRS: ADMIN004ResTRANRS;
}

export interface UserStatus {
  label: string;
  value: string;
}

export interface UserRole {
  label: string;
  value: string;
}
