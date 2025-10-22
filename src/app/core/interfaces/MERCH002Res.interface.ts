export interface MERCH002Tranrs {
    stats: never[];
    rooms: roomList[];
}

export interface roomList {
    id: string;
    name: string;
    totalUnits: number;
    basePrice: number;
    petTypeId: string;
    info: string;
    roomSize: string
}
