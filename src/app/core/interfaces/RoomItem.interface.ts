interface RoomItem {
    roomId: string;
    roomName: string;
    roomPrice: number;    // 單價(每間/每晚)
    roomQuantity: number; // 間數(每晚)
    roomTotal: number;    // 小計 = 單價 × 間數 × nights
    expanded: boolean;
};
