import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { BookService, OrderData } from './../../core/services/book-service';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { HotelService } from '../../core/services/hotel-service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-booking-done-page',
    imports: [ButtonModule, FormsModule],
    templateUrl: './booking-done-page.html',
    styleUrl: './booking-done-page.css'
})
export class BookingDonePage {

    /** 旅館相關屬性 */
    propertyName = '';
    propertyTel = '';
    propertyAddress = '';

    /** 訂單資訊 */
    orderData: OrderData = {
        propertyId: '',
        checkIn: '',
        checkOut: '',
        rooms: []
    };

    /**
     * 建構子注入
     */
    constructor(private router: Router, private bookService: BookService, private hotelService: HotelService, private messageService: MessageService) { };

    /**
     * 初始化頁面內容
     */
    ngOnInit(): void {

        this.orderData = this.bookService.getSharedOrderData();

        if (!this.orderData) {
            this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '資料傳輸異常，將導回 PETEL 首頁' });
            this.router.navigateByUrl('/');
        }

        this.hotelService.queryHotelDetail(this.orderData.propertyId).subscribe({
            next: (response) => {
                if (response.MWHEADER.RETURNCODE !== '0000') {
                    this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '旅館資訊載入異常' });
                    return;
                }
                const propertyDetail = response.TRANRS.property_details.at(0);
                this.propertyName = propertyDetail!.name;
                this.propertyTel = propertyDetail!.tel;
                this.propertyAddress = propertyDetail!.address;
            },
            error: (error) => {
                this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '旅館資訊載入異常' });
                return;
            }
        });
    }

    /**
     * 點擊聊聊按鈕，轉導至聊天室頁面
     */
    onChat(): void {
        this.router.navigateByUrl('/chat'); // TODO Check: see whether it needs additional info.
    }

    /**
     * 點擊查看歷史訂單按鈕，轉導至會員資訊頁面
     */
    onViewHistory(): void {
        this.router.navigateByUrl('/history');
    }
}
