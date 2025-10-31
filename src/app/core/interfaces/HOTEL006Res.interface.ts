export interface HOTEL006Tranrs {
    singleHotelDetail: SingleHotelDetail;
}

export interface SingleHotelDetail {
    name:           string;
    sellerId:       string;
    tel:            string;
    address:        string;
    postalCode:     string;
    bankAccount:    string;
    businessCode:   string;
    info:           string;
    checkNotice:    string;
    petNotice:      string;
    propertyNotice: string;
    avgRating:      number;
    reviewCount:    number;
    roomCount:      number;
    city:           string;
    district:       string;
    propertyImages: PropertyImage[];
    rooms:          Room[];
    reviews:        Review[];
    facilities:     Facility[];
}

export interface Facility {
    facilityId:   string;
    facilityName: string;
}

export interface PropertyImage {
    mediaId:    string;
    base64Data: string;
    fileName:   string;
    mimeType:   string;
    sortOrder:  number | null;
}

export interface Review {
    userId:       string;
    userName:     string;
    userAvatar:   PropertyImage;
    priceScore:   number;
    envScore:     number;
    serviceScore: number;
    content:      string;
}

export interface Room {
    roomId:     string;
    name:       string;
    info:       string;
    roomSize:   string;
    basePrice:  number;
    totalUnits: number;
    roomImages: any[];
}
