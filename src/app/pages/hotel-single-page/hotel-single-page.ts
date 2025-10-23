import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FloatLabel } from "primeng/floatlabel";
import { SelectModule } from "primeng/select";
import { DatePicker } from "primeng/datepicker";
import { InputNumberModule } from "primeng/inputnumber";
import { ButtonModule } from "primeng/button";
import { TabsModule } from "primeng/tabs";
import { GalleryImage } from '../../core/interfaces/gallery-image';
import { RatingModule } from "primeng/rating";
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { FieldsetModule } from 'primeng/fieldset';
import { AvatarModule } from "primeng/avatar";
import { SplitterModule } from 'primeng/splitter';
import { CheckboxModule } from 'primeng/checkbox';
import { SortOption } from '../../core/interfaces/sort-option';
import { GalleriaModule } from 'primeng/galleria';

@Component({
    selector: 'app-hotel-single-page',
    imports: [
        CommonModule,
        FloatLabel,
        SelectModule,
        DatePicker,
        InputNumberModule,
        ButtonModule,
        TabsModule,
        RatingModule,
        FormsModule,
        CardModule,
        DividerModule,
        ChipModule,
        FieldsetModule,
        AvatarModule,
        SplitterModule,
        CheckboxModule,
        GalleriaModule
    ],
    templateUrl: './hotel-single-page.html',
    styleUrl: './hotel-single-page.css'
})
export class HotelSinglePage implements OnInit {
    // 注入 HttpClient
    private http = inject(HttpClient);

    cities: Option[] | undefined;
    date: Date | undefined;
    types: Option[] | undefined;
    checked: boolean = false;
    checked2: boolean = false;
    checked3: boolean = false;
    checked4: boolean = false;
    checked5: boolean = false;
    checked6: boolean = false;
    checked7: boolean = false;
    checked8: boolean = false;
    checked9: boolean = false;

    // 宣告圖片資料陣列，綁定到 HTML 中的 [(value)]="images"
    images: GalleryImage[] = [];

    // 全螢幕 Galleria 控制
    displayCustom: boolean = false;
    activeIndex: number = 0;

    // PrimeNG 的響應式設定
    responsiveOptions: any[] = [
        { breakpoint: '1024px', numVisible: 5 },
        { breakpoint: '768px', numVisible: 3 },
        { breakpoint: '560px', numVisible: 1 }
    ];

    sortOptions: SortOption[];
    selectedSortOption: SortOption | undefined;

    constructor() {
        this.sortOptions = [
            { name: '價格由低到高', code: 'price_asc' },
            { name: '價格由高到低', code: 'price_desc' },
            { name: '評價分數由高到低', code: 'rating_desc' }
        ];
    }

    /**
     * 從後端 API 獲取圖片
     * @param hotelId 旅館 ID
     */
    loadHotelImages(hotelId: string): void {
        // 替換為您的實際 API 端點
        const apiUrl = `/api/hotels/${hotelId}/images`;

        this.http.get<any[]>(apiUrl).subscribe({
            next: (response) => {
                // 將後端數據轉換為 GalleryImage 格式
                this.images = response.map(img => ({
                    itemImageSrc: img.imageUrl || img.url,  // 主圖 URL
                    thumbnailImageSrc: img.thumbnailUrl || img.url,  // 縮圖 URL
                    alt: img.description || '旅館圖片',
                    title: img.title || ''
                }));
            },
            error: (error) => {
                console.error('載入圖片失敗:', error);
                // 可以設置預設圖片
                this.setDefaultImages();
            }
        });
    }

    /**
     * 設置預設圖片（測試或錯誤時使用）
     */
    setDefaultImages(): void {
        this.images = [
            {
                itemImageSrc: 'https://primefaces.org/cdn/primeng/images/galleria/galleria1.jpg',
                thumbnailImageSrc: 'https://primefaces.org/cdn/primeng/images/galleria/galleria1s.jpg',
                alt: '旅館外觀',
                title: '旅館外觀'
            },
            {
                itemImageSrc: 'https://primefaces.org/cdn/primeng/images/galleria/galleria2.jpg',
                thumbnailImageSrc: 'https://primefaces.org/cdn/primeng/images/galleria/galleria2s.jpg',
                alt: '客房',
                title: '客房'
            },
            {
                itemImageSrc: 'https://primefaces.org/cdn/primeng/images/galleria/galleria3.jpg',
                thumbnailImageSrc: 'https://primefaces.org/cdn/primeng/images/galleria/galleria3s.jpg',
                alt: '設施',
                title: '設施'
            },
            {
                itemImageSrc: 'https://primefaces.org/cdn/primeng/images/galleria/galleria4.jpg',
                thumbnailImageSrc: 'https://primefaces.org/cdn/primeng/images/galleria/galleria4s.jpg',
                alt: '公共空間',
                title: '公共空間'
            },
            {
                itemImageSrc: 'https://primefaces.org/cdn/primeng/images/galleria/galleria5.jpg',
                thumbnailImageSrc: 'https://primefaces.org/cdn/primeng/images/galleria/galleria5s.jpg',
                alt: '餐廳',
                title: '餐廳'
            }
        ];
    }

    /**
     * 打開全螢幕 Gallery
     * @param index 點擊的圖片索引
     */
    imageClick(index: number): void {
        this.activeIndex = index;
        this.displayCustom = true;
    }

    // 宣告一個變數來追蹤當前活動的標籤值
    // 初始值可以設定為 '0'
    activeTabValue: string = '0';

    // 宣告 'value' 屬性，用於儲存當前的評分 (通常是數字)
    // 由於 Rating 元件預期數值型別，通常初始化為 0 或您希望的預設值
    starValue: number = 4; // 範例：預設為 4 顆星

    ngOnInit(): void {
        this.cities = [
            { id: 'TPE', name: '臺北市' },
            { id: 'KEE', name: '基隆市' },
            { id: 'NWT', name: '新北市' },
            { id: 'ILA', name: '宜蘭縣' },
            { id: 'HSZ', name: '新竹市' },
            { id: 'HSQ', name: '新竹縣' },
            { id: 'TAO', name: '桃園市' },
            { id: 'MIA', name: '苗栗縣' },
            { id: 'TXG', name: '臺中市' },
            { id: 'CHA', name: '彰化縣' },
            { id: 'NAN', name: '南投縣' },
            { id: 'CYI', name: '嘉義市' },
            { id: 'CYQ', name: '嘉義縣' },
            { id: 'YUN', name: '雲林縣' },
            { id: 'TNN', name: '臺南市' },
            { id: 'KHH', name: '高雄市' },
            { id: 'PIF', name: '屏東縣' },
            { id: 'TTT', name: '臺東縣' },
            { id: 'HUA', name: '花蓮縣' }
        ];

        // 載入旅館圖片
        // 方法 1: 從路由參數獲取 hotelId (如果有使用路由)
        // const hotelId = this.route.snapshot.paramMap.get('id');
        // if (hotelId) {
        //     this.loadHotelImages(hotelId);
        // }

        // 方法 2: 使用固定的 hotelId 測試
        // this.loadHotelImages('hotel-123');

        // 方法 3: 暫時使用預設圖片測試 UI
        this.setDefaultImages();

        // 調試：確認圖片已載入
        console.log('Gallery images loaded:', this.images);
    }
}
