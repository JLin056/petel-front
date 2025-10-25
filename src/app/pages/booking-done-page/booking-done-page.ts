import { BookService, OrderData } from './../../core/services/book-service';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { HotelService } from '../../core/services/hotel-service';
import { Rating } from 'primeng/rating';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-booking-done-page',
    imports: [ButtonModule, Rating, FormsModule],
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
    constructor(private bookService: BookService, private hotelService: HotelService) { };

    /**
     * 初始化頁面內容
     */
    ngOnInit(): void {

        this.orderData = this.bookService.getSharedOrderData();

        this.hotelService.queryHotelDetail(this.orderData.propertyId).subscribe({
            next: (response) => {
                if (response.MWHEADER.RETURNCODE !== '0000') {
                    return;
                }
                const propertyDetail = response.TRANRS.property_details.at(0);
                this.propertyName = propertyDetail!.name;
                this.propertyTel = propertyDetail!.tel;
                this.propertyAddress = propertyDetail!.address;
            }
        });
    }

    onChat(): void {
        console.log('開始聊天');
    }

    onViewHistory(): void {
        console.log('查看歷史訂單');
    }
}
