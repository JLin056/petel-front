export interface MERCH004Tranrq {
    propertyId: string;
    name:       string;
    totalUnits: number;
    basePrice:  number;
    petTypeId:  string;
    info:       string;
    roomSize:   string;
    roomImages: RoomImage[];
}

export interface RoomImage {
    mediaId:   string;
    sortOrder: number;
}
