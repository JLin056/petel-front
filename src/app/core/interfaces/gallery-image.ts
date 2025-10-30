export interface GalleryImage {
    itemImageSrc: string;      // 主要圖片 URL (大圖)
    thumbnailImageSrc: string; // 縮圖 URL
    alt?: string;              // 圖片描述 (用於 alt 屬性)
    title?: string;            // 圖片標題
}
