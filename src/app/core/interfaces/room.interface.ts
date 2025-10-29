interface Room {
  name: string;
  info: string;
  roomSize: string;
  basePrice: number;
  totalUnits: number;
  roomImages: { base64Data: string }[];
}