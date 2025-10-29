interface Review {
  userName: string;
  content: string;
  priceScore: number;
  envScore: number;
  serviceScore: number;
  userAvatar?: { base64Data: string };
}