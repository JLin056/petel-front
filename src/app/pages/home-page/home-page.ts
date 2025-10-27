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
    name: string;
    image: string;
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
            { id: 'W001', name: '貓貓' },
            { id: 'W002', name: '狗狗' }
        ];

        this.dogHotels = [
            { name: '熊讚寵物窩', image: 'img/hotelImg.png' },
            { name: '喵喵旅館',   image: 'img/hotelImg.png' },
            { name: '汪星驛站',   image: 'img/hotelImg.png' },
            { name: '毛孩假期',   image: 'img/hotelImg.png' },
            { name: '熊讚寵物窩', image: 'img/hotelImg.png' },
            { name: '喵喵旅館',   image: 'img/hotelImg.png' },
            { name: '汪星驛站',   image: 'img/hotelImg.png' },
            { name: '毛孩假期',   image: 'img/hotelImg.png' },
            { name: '熊讚寵物窩', image: 'img/hotelImg.png' },
            { name: '喵喵旅館',   image: 'img/hotelImg.png' },
            { name: '汪星驛站',   image: 'img/hotelImg.png' },
            { name: '毛孩假期',   image: 'img/hotelImg.png' }
        ];

        this.catHotels = [
            { name: '熊讚寵物窩', image: 'img/hotelImg.png' },
            { name: '喵喵旅館',   image: 'img/hotelImg.png' },
            { name: '汪星驛站',   image: 'img/hotelImg.png' },
            { name: '毛孩假期',   image: 'img/hotelImg.png' }
        ];
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

        // 驗證日期：退房日必須晚於入住日
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

                    // 成功，跳轉到旅館列表頁，並傳遞搜尋結果
                    this.router.navigate(['/dogHotels'], {
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
