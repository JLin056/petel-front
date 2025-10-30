// 訂單備註更新 API
export interface ADMIN004ResTRANRS {
  orderId: string;
  note: string;
  updatedAt: string;
}

export interface ADMIN004Res {
  MWHEADER: {
    RETURNCODE: string;
    RETURNDESC: string;
  };
  TRANRS: ADMIN004ResTRANRS;
}

// 會員相關類型定義（保留給 admin-user-table 使用）
export interface UserStatus {
  label: string;
  value: string;
}

export interface UserRole {
  label: string;
  value: string;
}
