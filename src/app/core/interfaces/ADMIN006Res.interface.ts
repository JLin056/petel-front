export interface Hotel {
  PROPERTY_ID: string;
  PROPERTY_NAME: string;
  TEL: string;
  POSTAL_CODE: string;
  ADDRESS: string;
  BANK_ACCOUNT: string;
  SELLER_NAME: string;
  BUSINESS_CODE: string;
}

export interface ADMIN006Res {
  MWHEADER: {
    RETURNCODE: string;
    RETURNDESC: string;
  };
  TRANRS: {
    propertyId: string;
    message: string;
  };
}