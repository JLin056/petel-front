import { FormsModule } from '@angular/forms';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumber } from 'primeng/inputnumber';
import { Carousel, CarouselModule } from 'primeng/carousel';
import { HotelService } from '../../core/services/hotel-service';
import { MessageService } from 'primeng/api';
import { Option } from '../../core/interfaces/option.interface';

// 首頁輪播使用的簡單 Hotel 類型
interface Hotel {
    propertyId: string;
    name: string;
    image: string;
    petType: string;  // 用於跳轉時傳遞 petType
}

// Banner 圖片類型
interface BannerImage {
    src: string;
    alt: string;
}

@Component({
  selector: 'app-home-page',
  imports: [FormsModule, Select, ButtonModule, DatePicker, FloatLabel, IftaLabelModule, InputNumber, CarouselModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage implements OnInit {
    cities: Option[] | undefined;
    date: Date | undefined;
    types: Option[] | undefined;
    dogHotels: Hotel[] = [];
    catHotels: Hotel[] = [];

    // Banner 圖片列表
    bannerImages: BannerImage[] = [
        { src: 'https://petelcathay-user.s3.us-east-1.amazonaws.com/Petel_footage/PETEL+Demo+(2).jpg', alt: 'Petel 廣告圖 1' },
        { src: 'https://petelcathay-user.s3.us-east-1.amazonaws.com/Petel_footage/you-deng-zai-sha-fa-shang-de-ke-ai-xiao-rong-gou.jpg', alt: 'Petel 廣告圖 2' },
        { src: 'https://petelcathay-user.s3.us-east-1.amazonaws.com/Petel_footage/PETEL+Demo+(4).jpg', alt: 'Petel 廣告圖 3' },
        { src: 'https://petelcathay-user.s3.us-east-1.amazonaws.com/Petel_footage/zai-shi-nei-fang-song-de-ke-ai-mao.jpg', alt: 'Petel 廣告圖 4' }
    ];

    // 搜尋參數
    searchParams = {
        city: '',
        checkIn: undefined as Date | undefined,
        checkOut: undefined as Date | undefined,
        petType: '',
        petCount: 1
    };

    // 退房日的最小日期（必須比入住日晚）
    minCheckOutDate: Date | undefined;

    // 入住日的最小日期（今天，時間設為 00:00:00）
    minCheckInDate: Date = (() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    })();

    // 注入服務
    private hotelService = inject(HotelService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    responsiveOptions = [
        { breakpoint: '1400px', numVisible: 3, numScroll: 1 },
        { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
        { breakpoint: '767px',  numVisible: 2, numScroll: 1 },
        { breakpoint: '575px',  numVisible: 1, numScroll: 1 }
    ];

    onWheel(e: WheelEvent, c: Carousel) {
        e.preventDefault();
        if (e.deltaY > 0) c.navForward(e as any);
        else c.navBackward(e as any);
    }

    ngOnInit() {
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

        // 獲取狗狗旅館精選（評價最好的5間）
        this.loadTopDogHotels();

        // 獲取貓貓旅館精選（評價最好的5間）
        this.loadTopCatHotels();
    }

    /**
     * 加載評價最好的狗狗旅館
     */
    loadTopDogHotels() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const apiParams = {
            petType: 'DOG',
            checkIn: today,
            checkOut: tomorrow,
            petCount: 1,
            city: '',
            minRating: 0,  // 不限制評價
            pageNumber: 1,
            pageSize: 5    // 只取5間
        };

        console.log('=== 首頁 - 載入狗狗旅館精選 ===');

        this.hotelService.queryHotels(apiParams).subscribe({
            next: (response) => {
                if (response.MWHEADER.RETURNCODE === '0000') {
                    const hotels = response.TRANRS.hotels || [];

                    // 按評價排序（由高到低）
                    const sortedHotels = hotels.sort((a, b) => b.avgRating - a.avgRating);

                    // 轉換為首頁輪播格式
                    this.dogHotels = sortedHotels.map(hotel => ({
                        propertyId: hotel.propertyId,
                        name: hotel.name,
                        image: this.getHotelImageUrl(hotel),
                        petType: 'DOG'
                    }));

                    console.log(`成功載入 ${this.dogHotels.length} 間狗狗旅館`);
                } else {
                    console.error('載入狗狗旅館失敗:', response.MWHEADER.RETURNDESC);
                }
            },
            error: (error) => {
                console.error('API 錯誤:', error);
            }
        });
    }

    /**
     * 加載評價最好的貓貓旅館
     */
    loadTopCatHotels() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const apiParams = {
            petType: 'CAT',
            checkIn: today,
            checkOut: tomorrow,
            petCount: 1,
            city: '',
            minRating: 0,  // 不限制評價
            pageNumber: 1,
            pageSize: 5    // 只取5間
        };

        console.log('=== 首頁 - 載入貓貓旅館精選 ===');

        this.hotelService.queryHotels(apiParams).subscribe({
            next: (response) => {
                if (response.MWHEADER.RETURNCODE === '0000') {
                    const hotels = response.TRANRS.hotels || [];

                    // 按評價排序（由高到低）
                    const sortedHotels = hotels.sort((a, b) => b.avgRating - a.avgRating);

                    // 轉換為首頁輪播格式
                    this.catHotels = sortedHotels.map(hotel => ({
                        propertyId: hotel.propertyId,
                        name: hotel.name,
                        image: this.getHotelImageUrl(hotel),
                        petType: 'CAT'
                    }));

                    console.log(`成功載入 ${this.catHotels.length} 間貓貓旅館`);
                } else {
                    console.error('載入貓貓旅館失敗:', response.MWHEADER.RETURNDESC);
                }
            },
            error: (error) => {
                console.error('API 錯誤:', error);
            }
        });
    }

    /**
     * 獲取旅館圖片 URL
     */
    getHotelImageUrl(hotel: any): string {
        if (hotel.images && hotel.images.length > 0) {
            const firstImage = hotel.images[0];
            if (firstImage.base64Data) {
                return `data:${firstImage.mimeType || 'image/jpeg'};base64,${firstImage.base64Data}`;
            }
        }
        return 'img/hotelImg.png'; // 默認圖片
    }

    /**
     * 當選擇入住日時，更新退房日的最小日期
     */
    onCheckInChange() {
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
    onSearch() {
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

        console.log('=== Home Page - 執行搜尋 ===');
        console.log('搜尋參數:', this.searchParams);
        console.log('API 參數:', apiParams);

        // 調用 API
        this.hotelService.queryHotels(apiParams).subscribe({
            next: (response) => {
                console.log('=== API 回應 ===');
                console.log('回應資料:', response);

                if (response.MWHEADER.RETURNCODE === '0000') {
                    // 調試：檢查圖片數據
                    console.log('=== 首頁搜尋結果 ===');
                    console.log(`找到 ${response.TRANRS.hotels?.length || 0} 間旅館`);
                    response.TRANRS.hotels?.forEach((hotel, index) => {
                        console.log(`旅館 ${index + 1}: ${hotel.name}`);
                        console.log(`  - 圖片數量: ${hotel.images?.length || 0}`);
                        if (hotel.images && hotel.images.length > 0) {
                            console.log(`  - 第一張圖片結構:`, hotel.images[0]);
                        }
                    });

                    // 成功，根據寵物類型跳轉到對應的旅館列表頁
                    const targetRoute = apiParams.petType === 'CAT' ? '/catHotels' : '/dogHotels';
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
                console.error('API 錯誤:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: '錯誤',
                    detail: '連接後端 API 失敗，請稍後再試'
                });
            }
        });
    }

    /**
     * 跳轉到旅館詳情頁
     * @param propertyId 旅館 ID
     * @param petType 寵物種類
     */
    navigateToDetail(propertyId: string, petType: string) {
        console.log('=== 首頁 - 跳轉到旅館詳情頁 ===');
        console.log('propertyId:', propertyId);
        console.log('petType:', petType);

        // 使用默認日期：今天和明天
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 準備搜尋參數（用於詳情頁）
        const searchParams = {
            city: '',
            checkIn: today,
            checkOut: tomorrow,
            petType: petType,
            petCount: 1
        };

        console.log('搜尋參數:', searchParams);

        // 根據寵物類型跳轉到對應的詳情頁，使用 query parameter 傳遞 propertyId
        const targetRoute = petType === 'CAT' ? '/catSingleHotel' : '/dogSingleHotel';
        this.router.navigate([targetRoute], {
            queryParams: { propertyId: propertyId },
            state: { searchParams: searchParams }
        });
    }

    /**
     * 按寵物種類搜尋旅館（貓貓/狗狗按鈕）
     * @param petType 寵物種類 ('CAT' 或 'DOG')
     */
    onSearchByPetType(petType: string) {
        console.log('=== 按寵物種類搜尋 ===');
        console.log('寵物種類:', petType);

        // 使用默認日期：今天和明天
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 準備 API 參數
        const apiParams = {
            petType: petType,
            checkIn: today,
            checkOut: tomorrow,
            petCount: 1,
            city: '',  // 不指定城市
            pageNumber: 1,
            pageSize: 10
        };

        console.log('API 參數:', apiParams);

        // 調用 API
        this.hotelService.queryHotels(apiParams).subscribe({
            next: (response) => {
                console.log('=== API 回應 ===');
                console.log('回應資料:', response);

                if (response.MWHEADER.RETURNCODE === '0000') {
                    console.log(`找到 ${response.TRANRS.hotels?.length || 0} 間${petType === 'CAT' ? '貓貓' : '狗狗'}旅館`);

                    // 成功，根據寵物類型跳轉到對應的旅館列表頁
                    const targetRoute = petType === 'CAT' ? '/catHotels' : '/dogHotels';
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
                console.error('API 錯誤:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: '錯誤',
                    detail: '連接後端 API 失敗，請稍後再試'
                });
            }
        });
    }

}
