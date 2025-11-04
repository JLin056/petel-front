import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FloatLabel } from "primeng/floatlabel";
import { SelectModule } from "primeng/select";
import { DatePicker } from "primeng/datepicker";
import { InputNumberModule } from "primeng/inputnumber";
import { ButtonModule } from "primeng/button";
import { TabsModule } from "primeng/tabs";
import { GalleryImage } from '../../core/interfaces/gallery-image';
import { Option } from '../../core/interfaces/option.interface';
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
import { HotelService } from '../../core/services/hotel-service';
import { SingleHotelDetail, Room } from '../../core/interfaces/HOTEL005Res.interface';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { BookService, OrderData, OrderRoom } from '../../core/services/book-service';
import { Auth } from '../../core/services/auth.service';

@Component({
    selector: 'app-dog-single-page',
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
        GalleriaModule,
        DialogModule,
        ToastModule
    ],
    templateUrl: './dog-single-page.html',
    styleUrl: './dog-single-page.css'
})
export class DogSinglePage implements OnInit {
    // 注入服務
    private http = inject(HttpClient);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private location = inject(Location);
    private hotelService = inject(HotelService);
    private messageService = inject(MessageService);
    private bookService = inject(BookService);
    private authService = inject(Auth);

    // 旅館詳情資料
    hotelDetail: SingleHotelDetail | null = null;
    propertyId: string = '';

    // 搜尋參數（從 hotel-list-page 傳遞過來）
    searchParams = {
        city: '',
        checkIn: undefined as Date | undefined,
        checkOut: undefined as Date | undefined,
        petType: '',
        petCount: 1
    };

    cities: Option[] | undefined;
    date: Date | undefined;
    types: Option[] | undefined;

    // 日期限制
    minCheckInDate: Date = (() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    })(); // 入住日最小為當天（時間設為 00:00:00）
    minCheckOutDate: Date | undefined; // 退房日最小為入住日+1天

    // 狗狗體型選擇數量和選項
    dogSizeSelections = {
        mini: 0,    // W002 - 迷你犬
        small: 0,   // W003 - 小型犬
        medium: 0,  // W004 - 中型犬
        big: 0,     // W005 - 大型犬
        huge: 0     // W006 - 超大型犬
    };

    dogSizeOptions = {
        mini: [] as Option[],
        small: [] as Option[],
        medium: [] as Option[],
        big: [] as Option[],
        huge: [] as Option[]
    };

    dogSizeDisabled = {
        mini: true,
        small: true,
        medium: true,
        big: true,
        huge: true
    };

    dogSizePrices = {
        mini: 0,
        small: 0,
        medium: 0,
        big: 0,
        huge: 0
    };


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

    // 評論頁面的排序選項
    reviewSortOptions: SortOption[];
    selectedReviewSortOption: SortOption | undefined;

    constructor() {
        // 評論頁面：只有評分排序
        this.reviewSortOptions = [
            { name: '評價分數由高到低', code: 'rating_desc' },
            { name: '評價分數由低到高', code: 'rating_asc' }
        ];
    }

    /**
     * 載入旅館詳情（使用 HOTEL005 API）
     * @param propertyId 旅館 ID
     * @param petType 寵物種類（選填，預設為 'DOG'）
     */
    loadHotelDetail(propertyId: string, petType: string = 'DOG'): void {
        // 準備 API 參數
        const apiParams = {
            propertyId: propertyId,
            petType: petType,
            checkIn: this.searchParams.checkIn,
            checkOut: this.searchParams.checkOut
        };

        console.log('=== 調用 HOTEL-005 API ===');
        console.log('API 參數:', apiParams);

        this.hotelService.querySingleHotelDetail(apiParams).subscribe({
            next: (response) => {
                console.log('=== HOTEL-005 API 回應 ===');
                console.log('回應資料:', response);

                if (response.MWHEADER.RETURNCODE === '0000') {
                    this.hotelDetail = response.TRANRS.singleHotelDetail;
                    console.log('旅館詳情:', this.hotelDetail);

                    // 處理狗狗體型選項
                    this.processDogSizeOptions();
                } else {
                    console.warn('API 返回錯誤:', response.MWHEADER);
                    this.messageService.add({
                        severity: 'error',
                        summary: '錯誤',
                        detail: response.MWHEADER.RETURNDESC || '查詢失敗'
                    });
                }
            },
            error: (error) => {
                console.error('=== HOTEL-005 API 錯誤 ===');
                console.error('錯誤詳情:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: '錯誤',
                    detail: '連接後端 API 失敗，請稍後再試'
                });
            }
        });
    }

    /**
     * 處理狗狗體型選項（根據 room 的 petType 帶入 totalUnit）
     */
    processDogSizeOptions(): void {
        if (!this.hotelDetail || !this.hotelDetail.rooms) {
            console.warn('沒有房型資料');
            return;
        }

        console.log('=== 處理狗狗體型選項 ===');
        console.log('房型總數:', this.hotelDetail.rooms.length);
        console.log('完整房型資料:', JSON.stringify(this.hotelDetail.rooms, null, 2));

        // 初始化所有體型為 disabled，選項為空陣列
        this.dogSizeDisabled = {
            mini: true,
            small: true,
            medium: true,
            big: true,
            huge: true
        };

        this.dogSizeOptions = {
            mini: [],
            small: [],
            medium: [],
            big: [],
            huge: []
        };

        this.dogSizeSelections = {
            mini: 0,
            small: 0,
            medium: 0,
            big: 0,
            huge: 0
        };

        this.dogSizePrices = {
            mini: 0,
            small: 0,
            medium: 0,
            big: 0,
            huge: 0
        };

        // 遍歷所有房型
        this.hotelDetail.rooms.forEach((room, index) => {
            console.log(`\n--- 處理第 ${index + 1} 個房型 ---`);
            console.log('完整 room 物件:', room);

            const petType = (room as any).petType || room.petTypeId;
            const totalUnits = room.totalUnits || 0;

            console.log(`房型: ${room.name}`);
            console.log(`  - (room as any).petType: ${(room as any).petType}`);
            console.log(`  - room.petTypeId: ${room.petTypeId}`);
            console.log(`  - 最終 petType: ${petType}`);
            console.log(`  - totalUnits: ${totalUnits}`);

            // 如果 petType 為 0 或沒有，跳過（保持 disabled）
            if (!petType || petType === 0 || petType === '0') {
                console.log(`  ❌ 跳過此房型（petType 為 0 或不存在）`);
                return;
            }

            console.log(`  ✓ petType 有效，繼續處理`);

            // 建立選項陣列 (0 到 totalUnits)
            const options: Option[] = [];
            for (let i = 0; i <= totalUnits; i++) {
                options.push({ id: i.toString(), name: i.toString() });
            }

            // 根據 petType 對應到不同的狗狗體型，並啟用該選項
            switch (petType) {
                case 'W002': // 迷你犬
                    this.dogSizeOptions.mini = options;
                    this.dogSizeDisabled.mini = false;
                    this.dogSizePrices.mini = room.basePrice;
                    console.log(`迷你犬選項: 0-${totalUnits}, 價格: ${room.basePrice}`);
                    break;
                case 'W003': // 小型犬
                    this.dogSizeOptions.small = options;
                    this.dogSizeDisabled.small = false;
                    this.dogSizePrices.small = room.basePrice;
                    console.log(`小型犬選項: 0-${totalUnits}, 價格: ${room.basePrice}`);
                    break;
                case 'W004': // 中型犬
                    this.dogSizeOptions.medium = options;
                    this.dogSizeDisabled.medium = false;
                    this.dogSizePrices.medium = room.basePrice;
                    console.log(`中型犬選項: 0-${totalUnits}, 價格: ${room.basePrice}`);
                    break;
                case 'W005': // 大型犬
                    this.dogSizeOptions.big = options;
                    this.dogSizeDisabled.big = false;
                    this.dogSizePrices.big = room.basePrice;
                    console.log(`大型犬選項: 0-${totalUnits}, 價格: ${room.basePrice}`);
                    break;
                case 'W006': // 超大型犬
                    this.dogSizeOptions.huge = options;
                    this.dogSizeDisabled.huge = false;
                    this.dogSizePrices.huge = room.basePrice;
                    console.log(`超大型犬選項: 0-${totalUnits}, 價格: ${room.basePrice}`);
                    break;
                default:
                    console.warn(`未知的 petType: ${petType}`);
            }
        });

        console.log('狗狗體型選項:', this.dogSizeOptions);
        console.log('狗狗體型 disabled 狀態:', this.dogSizeDisabled);
        console.log('狗狗體型價格:', this.dogSizePrices);
    }

    /**
     * 處理旅館圖片（從 hotelDetail.propertyImages 轉換為 GalleryImage 格式）
     */
    /**
     * 處理旅館圖片（從 hotelDetail.propertyImages 轉換為 GalleryImage 格式）
     * 固定顯示 4 張照片，不足的用預設圖片補足
     */
    loadPropertyImages(): void {
        const defaultImage: GalleryImage = {
            itemImageSrc: 'https://petelcathay-user.s3.us-east-1.amazonaws.com/Petel_footage/16950.jpg',
            thumbnailImageSrc: 'https://petelcathay-user.s3.us-east-1.amazonaws.com/Petel_footage/16950.jpg',
            alt: '旅館圖片',
            title: '旅館圖片'
        };

        if (this.hotelDetail && this.hotelDetail.propertyImages && this.hotelDetail.propertyImages.length > 0) {
            // 載入實際圖片
            const actualImages = this.hotelDetail.propertyImages
                .sort((a, b) => a.sortOrder - b.sortOrder) // 按 sortOrder 排序
                .slice(0, 4) // 最多取 4 張
                .map(img => ({
                    itemImageSrc: `data:${img.mimeType};base64,${img.base64Data}`,
                    thumbnailImageSrc: `data:${img.mimeType};base64,${img.base64Data}`,
                    alt: img.fileName || '旅館圖片',
                    title: img.fileName || ''
                }));

            // 補足到 4 張
            this.images = [...actualImages];
            while (this.images.length < 4) {
                this.images.push({ ...defaultImage });
            }

            console.log(`已載入 ${actualImages.length} 張實際圖片，補足為 4 張`);
        } else {
            console.warn('沒有旅館圖片，使用預設圖片');
            // 全部使用預設圖片
            this.images = [defaultImage, defaultImage, defaultImage, defaultImage];
        }
    }

    /**
     * 從後端 API 獲取圖片（已不使用，保留作為參考）
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

    /**
     * 獲取房型圖片 URL
     * @param room 房型資料
     * @returns 圖片 URL（Base64 Data URI 或預設圖片）
     */
    getRoomImage(room: any): string {
        // 檢查是否有房型圖片
        if (room.roomImages && room.roomImages.length > 0) {
            const firstImage = room.roomImages[0];
            if (firstImage.base64Data) {
                const mimeType = firstImage.mimeType || 'image/jpeg';
                return `data:${mimeType};base64,${firstImage.base64Data}`;
            }
        }
        // 如果沒有圖片，返回預設圖片
        return 'https://www.star-interiordesign.com/images/pdt2/%E5%AF%B5%E7%89%A9-1.jpg';
    }

    /**
     * 計算所有評論的平均價格評分
     */
    getAveragePriceScore(): number {
        if (!this.hotelDetail || !this.hotelDetail.reviews || this.hotelDetail.reviews.length === 0) {
            return 0;
        }
        const total = this.hotelDetail.reviews.reduce((sum, review) => sum + review.priceScore, 0);
        return total / this.hotelDetail.reviews.length;
    }

    /**
     * 計算所有評論的平均環境評分
     */
    getAverageEnvScore(): number {
        if (!this.hotelDetail || !this.hotelDetail.reviews || this.hotelDetail.reviews.length === 0) {
            return 0;
        }
        const total = this.hotelDetail.reviews.reduce((sum, review) => sum + review.envScore, 0);
        return total / this.hotelDetail.reviews.length;
    }

    /**
     * 計算所有評論的平均服務評分
     */
    getAverageServiceScore(): number {
        if (!this.hotelDetail || !this.hotelDetail.reviews || this.hotelDetail.reviews.length === 0) {
            return 0;
        }
        const total = this.hotelDetail.reviews.reduce((sum, review) => sum + review.serviceScore, 0);
        return total / this.hotelDetail.reviews.length;
    }

    /**
     * 計算單一評論的平均評分（用於顯示星星）
     */
    getReviewAverageScore(review: any): number {
        return (review.priceScore + review.envScore + review.serviceScore) / 3;
    }

    /**
     * 獲取用戶頭像 URL
     * @param review 評論資料
     * @returns 頭像 URL（Base64 Data URI 或預設頭像）
     */
    getUserAvatar(review: any): string {
        console.log('getUserAvatar - review 物件:', review);
        console.log('getUserAvatar - userAvatar:', review.userAvatar);

        // 檢查是否有用戶頭像（可能是陣列或單一物件）
        if (review.userAvatar) {
            let avatar;

            // 判斷是陣列還是物件
            if (Array.isArray(review.userAvatar)) {
                if (review.userAvatar.length > 0) {
                    avatar = review.userAvatar[0];
                }
            } else {
                // 直接是物件
                avatar = review.userAvatar;
            }

            console.log('getUserAvatar - avatar 物件:', avatar);

            if (avatar && avatar.base64Data) {
                console.log('getUserAvatar - base64Data 長度:', avatar.base64Data.length);
                const mimeType = avatar.mimeType || 'image/jpeg';
                const dataUri = `data:${mimeType};base64,${avatar.base64Data}`;
                console.log('getUserAvatar - 返回 Data URI (前50字元):', dataUri.substring(0, 50));
                return dataUri;
            }
        }

        console.log('getUserAvatar - 使用預設頭像');
        // 如果沒有頭像，返回預設頭像
        return 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png';
    }

    /**
     * 獲取最高分的評論
     * @returns 最高分的評論，如果沒有評論則返回 null
     */
    getHighestRatedReview(): any {
        if (!this.hotelDetail || !this.hotelDetail.reviews || this.hotelDetail.reviews.length === 0) {
            return null;
        }

        return this.hotelDetail.reviews.reduce((highest, current) => {
            const currentAvg = this.getReviewAverageScore(current);
            const highestAvg = this.getReviewAverageScore(highest);
            return currentAvg > highestAvg ? current : highest;
        });
    }

    /**
     * 獲取推薦房型（庫存數量最多的前三間）
     * @returns 庫存最多的前三間房間
     */
    getRecommendedRooms(): Room[] {
        if (!this.hotelDetail || !this.hotelDetail.rooms || this.hotelDetail.rooms.length === 0) {
            return [];
        }

        // 複製陣列並按庫存數量排序（由多到少）
        const sortedRooms = [...this.hotelDetail.rooms].sort((a, b) => b.totalUnits - a.totalUnits);

        // 取前三間
        return sortedRooms.slice(0, 3);
    }


    /**
     * 獲取排序後的評論列表
     * @returns 排序後的評論陣列
     */
    getSortedReviews(): any[] {
        if (!this.hotelDetail || !this.hotelDetail.reviews) {
            return [];
        }

        const reviews = [...this.hotelDetail.reviews]; // 複製陣列，避免修改原始資料

        if (!this.selectedReviewSortOption) {
            return reviews; // 如果沒有選擇排序，返回原始順序
        }

        switch (this.selectedReviewSortOption.code) {
            case 'rating_desc':
                // 評價分數由高到低
                return reviews.sort((a, b) => {
                    const avgA = (a.priceScore + a.envScore + a.serviceScore) / 3;
                    const avgB = (b.priceScore + b.envScore + b.serviceScore) / 3;
                    return avgB - avgA;
                });
            case 'rating_asc':
                // 評價分數由低到高
                return reviews.sort((a, b) => {
                    const avgA = (a.priceScore + a.envScore + a.serviceScore) / 3;
                    const avgB = (b.priceScore + b.envScore + b.serviceScore) / 3;
                    return avgA - avgB;
                });
            default:
                return reviews;
        }
    }


    /**
     * 跳轉到房型介绍頁（Tab 1）
     */
    goToRoomTypePage(): void {
        this.activeTabValue = '1';
    }

    /**
     * 返回到搜尋列表頁（上一頁）
     */
    goBackToList(): void {
        this.location.back();
    }

    /**
     * 處理預訂功能
     */
    onBooking(): void {
        // 先檢查登入狀態
        this.authService.onCheckLoginStatus().subscribe({
            next: (response) => {
                console.log('checkLoginStatus response:', response);
                console.log('valid:', response.TRANRS?.valid);

                if (response.MWHEADER.RETURNCODE === '0000' && response.TRANRS?.valid) {
                    // 已登入，繼續預訂流程（跳轉到 bookingPage）
                    this.proceedWithBooking();
                } else {
                    // 未登入，先準備訂單數據並保存，然後跳轉到登入頁
                    const orderData = this.prepareOrderData();
                    if (!orderData) {
                        // 如果訂單數據準備失敗（例如驗證失敗），不跳轉
                        return;
                    }

                    // 保存訂單數據到 bookService
                    this.bookService.setSharedOrderData(orderData);

                    this.messageService.add({
                        severity: 'warn',
                        summary: '提醒',
                        detail: '預訂房間需要登入會員，將導至登入頁'
                    });

                    // 跳轉到登入頁，登入成功後會自動跳轉到 bookingPage
                    this.router.navigate(['/login'], {
                        queryParams: { redirect: '/book' }
                    });
                }
            },
            error: (error) => {
                // 登入驗證失敗，先準備訂單數據並保存，然後跳轉到登入頁
                console.error('checkLoginStatus error:', error);

                const orderData = this.prepareOrderData();
                if (!orderData) {
                    return;
                }

                this.bookService.setSharedOrderData(orderData);

                this.messageService.add({
                    severity: 'warn',
                    summary: '提醒',
                    detail: '預訂房間需要登入會員，將導至登入頁'
                });

                this.router.navigate(['/login'], {
                    queryParams: { redirect: '/book' }
                });
            }
        });
    }

    /**
     * 準備訂單數據（驗證並組裝）
     * @returns 訂單數據，如果驗證失敗則返回 null
     */
    private prepareOrderData(): OrderData | null {
        // 驗證必填欄位：入住日和退房日
        if (!this.searchParams.checkIn || !this.searchParams.checkOut) {
            this.messageService.add({
                severity: 'warn',
                summary: '提醒',
                detail: '請選擇入住日及退房日'
            });
            return null;
        }

        // 檢查是否至少選擇了一個房型
        if (!this.hotelDetail || !this.hotelDetail.rooms) {
            this.messageService.add({
                severity: 'warn',
                summary: '提醒',
                detail: '無可用房型'
            });
            return null;
        }

        // 收集已選擇的狗狗體型數量
        const selectedRooms: OrderRoom[] = [];

        // 定義 petType 對應關係
        const petTypeMapping: { [key: string]: string } = {
            mini: 'W002',
            small: 'W003',
            medium: 'W004',
            big: 'W005',
            huge: 'W006'
        };

        // 遍歷狗狗體型選擇
        Object.entries(this.dogSizeSelections).forEach(([sizeKey, quantity]) => {
            if (quantity && quantity > 0) {
                const petTypeId = petTypeMapping[sizeKey];

                // 找到對應的房型
                const room = this.hotelDetail!.rooms.find(r => {
                    const roomPetType = (r as any).petType || r.petTypeId;
                    return roomPetType === petTypeId;
                });

                if (room) {
                    selectedRooms.push({
                        roomId: room.roomId,
                        roomName: room.name,
                        roomPrice: room.basePrice,
                        roomQuantity: Number(quantity),
                        roomTotal: room.basePrice * Number(quantity),
                        expanded: false
                    });
                }
            }
        });

        // 檢查是否至少選擇了一個體型
        if (selectedRooms.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: '提醒',
                detail: '請至少選擇一個狗狗體型及數量'
            });
            return null;
        }

        // 格式化日期為 YYYY-MM-DD
        const formatDate = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // 準備訂單數據
        const orderData: OrderData = {
            propertyId: this.propertyId,
            checkIn: formatDate(this.searchParams.checkIn),
            checkOut: formatDate(this.searchParams.checkOut),
            rooms: selectedRooms
        };

        console.log('=== 準備訂單數據 ===');
        console.log('訂單數據:', orderData);

        return orderData;
    }

    /**
     * 繼續預訂流程（已驗證登入）
     */
    private proceedWithBooking(): void {
        const orderData = this.prepareOrderData();
        if (!orderData) {
            return;
        }

        // 將訂單數據存入 BookService
        this.bookService.setSharedOrderData(orderData);

        // 導航到預訂頁面
        this.router.navigate(['/book']);
    }

    /**
     * 當選擇入住日時，更新退房日的最小日期
     */
    onCheckInChange(): void {
        if (this.searchParams.checkIn) {
            // 退房日最少要比入住日晚一天
            const minDate = new Date(this.searchParams.checkIn);
            minDate.setDate(minDate.getDate() + 1);
            this.minCheckOutDate = minDate;

            // 如果已選擇的退房日早於或等於入住日，清除退房日
            if (this.searchParams.checkOut && this.searchParams.checkOut <= this.searchParams.checkIn) {
                this.searchParams.checkOut = undefined;
            }
        }
    }

    /**
     * 搜尋旅館
     */
    onSearch(): void {
        // 驗證必填欄位：petType
        if (!this.searchParams.petType) {
            this.messageService.add({
                severity: 'warn',
                summary: '提醒',
                detail: '請選擇寵物種類'
            });
            return;
        }

        // 驗證必填欄位：入住日和退房日
        if (!this.searchParams.checkIn || !this.searchParams.checkOut) {
            this.messageService.add({
                severity: 'warn',
                summary: '提醒',
                detail: '請選擇入住日及退房日'
            });
            return;
        }

        // 驗證日期：退房日必須晚於入住日
        if (this.searchParams.checkOut <= this.searchParams.checkIn) {
            this.messageService.add({
                severity: 'warn',
                summary: '提醒',
                detail: '退房日必須晚於入住日'
            });
            return;
        }

        // 準備 API 參數
        const apiParams = {
            petType: this.searchParams.petType,
            checkIn: this.searchParams.checkIn,
            checkOut: this.searchParams.checkOut,
            petCount: this.searchParams.petCount,
            city: this.searchParams.city,
            pageNumber: 1,
            pageSize: 10
        };

        console.log('=== Single Page - 執行搜尋 ===');
        console.log('搜尋參數:', this.searchParams);
        console.log('API 參數:', apiParams);

        // 調用 HOTEL001 API
        this.hotelService.queryHotels(apiParams).subscribe({
            next: (response) => {
                console.log('=== HOTEL001 API 回應 ===');
                console.log('回應資料:', response);

                if (response.MWHEADER.RETURNCODE === '0000') {
                    // 🔹 根據 petType 決定要導向的頁面
                    const targetRoute = apiParams.petType === 'CAT' ? '/catHotels' : '/dogHotels';
                    console.log(`導向頁面: ${targetRoute}`);

                    // 成功，跳轉到旅館列表頁，並傳遞搜尋結果
                    this.router.navigate([targetRoute], {
                        state: {
                            searchResult: response.TRANRS,
                            searchParams: apiParams
                        }
                    });
                } else {
                    // API 返回錯誤
                    this.messageService.add({
                        severity: 'error',
                        summary: '錯誤',
                        detail: response.MWHEADER.RETURNDESC || '查詢失敗'
                    });
                }
            },
            error: (error) => {
                console.error('=== HOTEL001 API 錯誤 ===');
                console.error('錯誤詳情:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: '錯誤',
                    detail: '連接後端 API 失敗，請稍後再試'
                });
            }
        });
    }

    // 宣告一個變數來追蹤當前活動的標籤值
    // 初始值可以設定為 '0'
    activeTabValue: string = '0';

    // 宣告 'value' 屬性，用於儲存當前的評分 (通常是數字)
    // 由於 Rating 元件預期數值型別，通常初始化為 0 或您希望的預設值
    starValue: number = 4; // 範例：預設為 4 顆星

    ngOnInit(): void {
        // 優先從 query parameter 獲取 propertyId
        const propertyIdFromQuery = this.route.snapshot.queryParamMap.get('propertyId');

        // 從 router state 獲取傳遞過來的資料
        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras?.state || window.history.state;

        console.log('=== Hotel Single Page - 初始化 ===');
        console.log('Query propertyId:', propertyIdFromQuery);
        console.log('Router state:', state);

        if (propertyIdFromQuery) {
            // 有 propertyId，存儲並檢查是否需要重新加載數據
            this.propertyId = propertyIdFromQuery;

            // 優先恢復搜尋參數（無論是否有 hotelDetail）
            if (state && state.searchParams) {
                // 将日期字符串转换为 Date 对象
                const checkIn = state.searchParams.checkIn ? new Date(state.searchParams.checkIn) : undefined;
                const checkOut = state.searchParams.checkOut ? new Date(state.searchParams.checkOut) : undefined;

                this.searchParams = {
                    city: state.searchParams.city || '',
                    checkIn: checkIn,
                    checkOut: checkOut,
                    petType: state.searchParams.petType || '',
                    petCount: state.searchParams.petCount || 1
                };

                // 設置退房日的最小日期
                if (this.searchParams.checkIn) {
                    const minDate = new Date(this.searchParams.checkIn);
                    minDate.setDate(minDate.getDate() + 1);
                    this.minCheckOutDate = minDate;
                }

                console.log('恢復搜尋參數:', this.searchParams);
            }

            if (state && state.hotelDetail) {
                // 如果有從 hotel-list-page 傳遞的完整旅館資料，直接使用
                this.hotelDetail = state.hotelDetail;
                console.log('使用傳遞的旅館詳情:', this.hotelDetail);

                // 處理旅館圖片
                this.loadPropertyImages();

                // 處理狗狗體型選項
                this.processDogSizeOptions();
            } else {
                // 沒有 hotelDetail，需要調用 API 加載
                console.log('調用 API 加載旅館詳情');

                // 使用 searchParams 中的日期和 petType，如果沒有則使用默認值
                const checkIn = this.searchParams.checkIn || (() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return today;
                })();
                const checkOut = this.searchParams.checkOut || (() => {
                    const tomorrow = new Date(checkIn);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return tomorrow;
                })();
                const petType = this.searchParams.petType || 'DOG';

                // 如果 searchParams 沒有日期，設置默認值
                if (!this.searchParams.checkIn) {
                    this.searchParams.checkIn = checkIn;
                }
                if (!this.searchParams.checkOut) {
                    this.searchParams.checkOut = checkOut;
                }
                if (!this.searchParams.petType) {
                    this.searchParams.petType = petType;
                }

                this.hotelService.querySingleHotelDetail({
                    propertyId: this.propertyId,
                    petType: petType,
                    checkIn: checkIn,
                    checkOut: checkOut
                }).subscribe({
                    next: (response) => {
                        if (response.MWHEADER.RETURNCODE === '0000') {
                            this.hotelDetail = response.TRANRS.singleHotelDetail;
                            this.loadPropertyImages();
                            console.log('成功加載旅館詳情:', this.hotelDetail);
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: '錯誤',
                                detail: '查詢旅館詳情失敗'
                            });
                        }
                    },
                    error: (error) => {
                        console.error('查詢旅館詳情失敗:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: '錯誤',
                            detail: '查詢旅館詳情失敗'
                        });
                    }
                });
            }
        } else {
            // 沒有 propertyId，無法顯示頁面
            console.warn('未獲取 propertyId，請確保從旅館列表頁正確導航');
            this.messageService.add({
                severity: 'warn',
                summary: '提醒',
                detail: '缺少必要的旅館資訊，請從旅館列表頁重新選擇'
            });
        }

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

        this.types = [
            { id: 'CAT', name: '貓貓' },
            { id: 'DOG', name: '狗狗' }
        ];
    }
}
