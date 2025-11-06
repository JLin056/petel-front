import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter, Subject, takeUntil } from 'rxjs';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumber } from 'primeng/inputnumber';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Listbox } from 'primeng/listbox';
import { Rating } from 'primeng/rating';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { HotelService } from '../../core/services/hotel-service';
import { MessageService } from 'primeng/api';
import { Hotel as HotelResponse } from '../../core/interfaces/HOTEL001Res.interface';
import { Option } from '../../core/interfaces/option.interface';
import { priceRange } from '../../core/interfaces/priceRange.interface';

@Component({
    selector: 'app-cat-list-page',
    imports: [
        CommonModule,
        FormsModule,
        DecimalPipe,
        Select,
        ButtonModule,
        DatePicker,
        FloatLabel,
        IftaLabelModule,
        InputNumber,
        InputGroupAddonModule,
        Listbox,
        Rating,
        PaginatorModule
    ],
    templateUrl: './cat-list-page.html',
    styleUrl: './cat-list-page.css'
})
export class CatListPage implements OnInit, OnDestroy {
    cities: Option[] | undefined;
    date: Date | undefined;
    types: Option[] | undefined;
    value: number = 4;
    priceRanges: priceRange[] = [];
    hotFilters: Option[] = [];
    sortSelect: Option[] = [];

    // 用於取消訂閱
    private destroy$ = new Subject<void>();
    first: number = 0;
    rows: number = 10;

    // 搜尋參數
    searchParams = {
        city: '',
        checkIn: undefined as Date | undefined,
        checkOut: undefined as Date | undefined,
        petType: '',
        petCount: 1
    };

    // 退房日的最小日期
    minCheckOutDate: Date | undefined;

    // 入住日的最小日期（今天，時間設為 00:00:00）
    minCheckInDate: Date = (() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    })();

    // 搜尋結果
    hotels: HotelResponse[] = [];
    totalRecords: number = 0;
    currentPage: number = 1;

    // 當前顯示的搜尋條件（用於顯示在標題，只有搜尋成功後才更新）
    displayCity: string = '';

    // 進階搜尋篩選
    selectedPriceRange: priceRange | null = null;  // 改為單選
    selectedRating: number = 0;
    selectedFilters: Option[] = [];
    hotelNameSearch: string = '';

    // 排序選項
    selectedSort: Option | undefined;

    // 注入服務
    private hotelService = inject(HotelService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    onPageChange(event: PaginatorState) {
        this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;
        this.currentPage = (this.first / this.rows) + 1;
        // 當分頁改變時重新搜尋
        this.performSearch();
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

        this.priceRanges = [
            { min: 0,    max: 1000 },
            { min: 1000, max: 1500 },
            { min: 1500, max: 1800 },
            { min: 1800, max: 2200 },
            { min: 2200, max: 5000 },
            { min: 5000, max: 999999 }
        ]

        this.hotFilters = [
            { id: 'F000000001',  name: '室內活動空間' },
            { id: 'F000000002',  name: '室外活動空間' },
            { id: 'F000000003',  name: '鄰近公園' },
            { id: 'F000000004',  name: '獨立房間' },
            { id: 'F000000005',  name: '獨立陽台' },
            { id: 'F000000006',  name: '對外窗' },
            { id: 'F000000007',  name: '實木跳台' },
            { id: 'F000000008',  name: '流動飲水機' },
            { id: 'F000000014',  name: '24小時獨立冷暖空調' },
            { id: 'F000000018',  name: '24小時視訊連線' },
            { id: 'F000000023',  name: '寵物美容' },
            { id: 'F000000024',  name: '專車接送' }
        ];

        this.sortSelect = [
            {id: 1, name: '依價位（由高到低）'},
            {id: 2, name: '依價位（由低到高）'},
            {id: 3, name: '依評價'}
        ];

        // 首次加載數據
        this.loadDataFromRouterState();

        // 監聽路由變化，當在同一個路由但 state 變化時重新加載數據
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                // 路由結束後，檢查是否有新的 state 數據
                this.loadDataFromRouterState();
            });
    }

    /**
     * 從 router state 加載數據
     */
    private loadDataFromRouterState(): void {
        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras?.state || window.history.state;

        if (state && state.searchResult) {
            // 如果有搜尋結果，直接使用
            this.hotels = state.searchResult.hotels || [];
            this.totalRecords = state.searchResult.totalCount || 0;

            // 恢復搜尋參數
            if (state.searchParams) {
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

                // 更新顯示的城市名稱
                this.displayCity = this.searchParams.city || '';

                // 設置退房日的最小日期
                if (this.searchParams.checkIn) {
                    const minDate = new Date(this.searchParams.checkIn);
                    minDate.setDate(minDate.getDate() + 1);
                    this.minCheckOutDate = minDate;
                }
            }

            // 如果有選擇排序方式，進行排序
            if (this.selectedSort) {
                this.sortHotels();
            }
        }
    }

    /**
     * 組件銷毀時取消訂閱
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * 當選擇入住日時，更新退房日的最小日期
     */
    onCheckInChange() {
        if (this.searchParams.checkIn) {
            const minDate = new Date(this.searchParams.checkIn);
            minDate.setDate(minDate.getDate() + 1);
            this.minCheckOutDate = minDate;

            if (this.searchParams.checkOut && this.searchParams.checkOut <= this.searchParams.checkIn) {
                this.searchParams.checkOut = undefined;
            }
        }
    }

    /**
     * 執行搜尋（從 search-bar 的搜尋按鈕觸發）
     */
    onSearch() {
        // 驗證必填欄位
        if (!this.searchParams.petType) {
            this.messageService.add({
                severity: 'warn',
                summary: '提醒',
                detail: '請選擇寵物種類'
            });
            return;
        }

        // 驗證日期
        if (this.searchParams.checkIn && this.searchParams.checkOut) {
            if (this.searchParams.checkOut <= this.searchParams.checkIn) {
                this.messageService.add({
                    severity: 'warn',
                    summary: '提醒',
                    detail: '退房日必須晚於入住日'
                });
                return;
            }
        }

        // 🔹 檢查 petType 是否改變，如果改變則導向對應的頁面
        if (this.searchParams.petType !== 'CAT') {
            const targetRoute = this.searchParams.petType === 'DOG' ? '/dogHotels' : '/catHotels';

            // 先執行搜尋取得結果，再導頁
            const apiParams = {
                petType: this.searchParams.petType,
                checkIn: this.searchParams.checkIn,
                checkOut: this.searchParams.checkOut,
                petCount: this.searchParams.petCount,
                city: this.searchParams.city,
                pageNumber: 1,
                pageSize: this.rows
            };

            this.hotelService.queryHotels(apiParams).subscribe({
                next: (response) => {
                    if (response.MWHEADER.RETURNCODE === '0000') {
                        this.router.navigate([targetRoute], {
                            state: {
                                searchResult: response.TRANRS,
                                searchParams: this.searchParams
                            }
                        });
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: '錯誤',
                            detail: response.MWHEADER.RETURNDESC || '查詢失敗'
                        });
                    }
                },
                error: (_error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: '錯誤',
                        detail: '連接後端 API 失敗，請稍後再試'
                    });
                }
            });
            return;
        }

        // 重置分頁
        this.first = 0;
        this.currentPage = 1;

        // 執行搜尋（在當前頁面）
        this.performSearch();
    }

    /**
     * 實際執行 API 搜尋
     */
    /**
     * 進階篩選變更時觸發
     */
    onFilterChange() {
        // 重新執行搜尋
        this.performSearch();
    }

    performSearch() {
        // 檢查必填欄位
        if (!this.searchParams.petType) {
            this.messageService.add({
                severity: 'warn',
                summary: '提醒',
                detail: '請先選擇寵物種類後再搜尋'
            });
            return;
        }

        // 計算價格範圍（單選）
        let priceMin: number | undefined;
        let priceMax: number | undefined;

        if (this.selectedPriceRange) {
            priceMin = this.selectedPriceRange.min;
            priceMax = this.selectedPriceRange.max;
        }

        // 提取設施 ID（確保轉換為字串）
        const facilities = this.selectedFilters ? this.selectedFilters.map(f => String(f.id)) : [];

        // 準備 API 參數
        const apiParams = {
            petType: this.searchParams.petType,
            checkIn: this.searchParams.checkIn,
            checkOut: this.searchParams.checkOut,
            petCount: this.searchParams.petCount,
            city: this.searchParams.city,
            priceMin: priceMin,
            priceMax: priceMax,
            minRating: this.selectedRating || 0,
            facilities: facilities,
            pageNumber: this.currentPage,
            pageSize: this.rows
        };

        // 調用 API
        this.hotelService.queryHotels(apiParams).subscribe({
            next: (response) => {
                if (response.MWHEADER.RETURNCODE === '0000') {
                    this.hotels = response.TRANRS.hotels || [];
                    this.totalRecords = response.TRANRS.totalCount || 0;

                    // 搜尋成功後，更新顯示的城市名稱
                    this.displayCity = this.searchParams.city || '';

                    // 如果有選擇排序方式，重新排序
                    if (this.selectedSort) {
                        this.sortHotels();
                    }
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: '錯誤',
                        detail: response.MWHEADER.RETURNDESC || '查詢失敗'
                    });
                }
            },
            error: (_error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: '錯誤',
                    detail: '連接後端 API 失敗，請稍後再試'
                });
            }
        });
    }

    /**
     * 獲取城市名稱（用於顯示在標題）
     */
    getCityName(): string {
        // 使用 displayCity（只有搜尋成功後才更新），而不是 searchParams.city
        return this.displayCity || '所有城市';
    }

    /**
     * 排序變更事件
     */
    onSortChange() {
        if (!this.selectedSort) {
            return;
        }

        this.sortHotels();
    }

    /**
     * 對旅館列表進行排序
     */
    sortHotels() {
        if (!this.selectedSort || this.hotels.length === 0) {
            return;
        }

        const sortId = this.selectedSort.id;

        switch (sortId) {
            case 1: // 依價位（由高到低）
                this.hotels.sort((a, b) => b.minPrice - a.minPrice);
                break;

            case 2: // 依價位（由低到高）
                this.hotels.sort((a, b) => a.minPrice - b.minPrice);
                break;

            case 3: // 依評價
                this.hotels.sort((a, b) => b.avgRating - a.avgRating);
                break;

            default:
                break;
        }
    }

    /**
     * 導航到旅館詳情頁
     * @param propertyId 旅館 ID
     */
    navigateToDetail(propertyId: string): void {
        // 檢查必要參數
        if (!this.searchParams.petType) {
            this.messageService.add({
                severity: 'warn',
                summary: '提醒',
                detail: '請先選擇寵物種類後再查看旅館詳情'
            });
            return;
        }

        // 準備 HOTEL005 API 參數
        const apiParams = {
            propertyId: propertyId,
            petType: this.searchParams.petType,
            checkIn: this.searchParams.checkIn,
            checkOut: this.searchParams.checkOut
        };

        // 調用 HOTEL005 API
        this.hotelService.querySingleHotelDetail(apiParams).subscribe({
            next: (response) => {
                if (response.MWHEADER.RETURNCODE === '0000') {
                    // 成功，導航到貓貓旅館詳情頁，使用 query parameter 傳遞 propertyId
                    this.router.navigate(['/catSingleHotel'], {
                        queryParams: { propertyId: propertyId },
                        state: {
                            hotelDetail: response.TRANRS.singleHotelDetail,
                            searchParams: this.searchParams
                        }
                    });
                } else {
                    // API 返回錯誤
                    this.messageService.add({
                        severity: 'error',
                        summary: '錯誤',
                        detail: response.MWHEADER.RETURNDESC || '查詢旅館詳情失敗'
                    });
                }
            },
            error: (_error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: '錯誤',
                    detail: '連接後端 API 失敗，請稍後再試'
                });
            }
        });
    }

    /**
     * 獲取旅館圖片 URL
     * @param hotel 旅館資料
     * @returns 圖片 URL（Base64 Data URI 或預設圖片）
     */
    getHotelImage(hotel: HotelResponse): string {
        // 檢查是否有圖片
        if (hotel.images && hotel.images.length > 0) {
            const firstImage = hotel.images[0];

            // 如果有 base64Data，轉換為 Data URI
            if (firstImage.base64Data) {
                const mimeType = firstImage.mimeType || 'image/jpeg';
                const dataUri = `data:${mimeType};base64,${firstImage.base64Data}`;
                return dataUri;
            }
        }

        // 如果沒有圖片，返回預設圖片
        return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjLY0xiOMf_AsUP53E1yKP7ycbeci0jvTDqCMipsuaXZMOO3njL-xhyphenhyphenDF3S0vclWZRpA-3_nZsaxJm3y5qwoVOzz-cRtS0DYlZZGk6UAK5IJq9pgy8Bx8WIfLJXISV0OvVkpugfBVYWDYg/s800/pet_building_hotel.png';
    }
}
