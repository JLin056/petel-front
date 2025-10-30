export interface HOTEL002Tranrs {
    property_details: PropertyDetail[];
}

export interface PropertyDetail {
    name:           string;
    tel:            string;
    businessCode:   string;
    bankAccount:    string;
    postalCode:     string;
    address:        string;
    info:           string;
    checkNotice:    string;
    petNotice:      string;
    propertyNotice: string;
}
