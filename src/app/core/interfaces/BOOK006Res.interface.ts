export interface BOOK006Tranrs {
    ecPay_params: EcPayParams;
}

export interface EcPayParams {
    EncryptType:       number;
    PaymentType:       string;
    ItemName:          string;
    MerchantTradeDate: string;
    ReturnURL:         string;
    MerchantID:        string;
    TotalAmount:       number;
    CheckMacValue:     string;
    MerchantTradeNo:   string;
    TradeDesc:         string;
    ChoosePayment:     string;
    ClientBackURL:     string;
}
