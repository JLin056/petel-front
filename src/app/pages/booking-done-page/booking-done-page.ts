import { ChatService } from './../../core/services/chat.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { BookService, OrderData } from './../../core/services/book-service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { HotelService } from '../../core/services/hotel-service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-booking-done-page',
    imports: [ButtonModule, FormsModule],
    templateUrl: './booking-done-page.html',
    styleUrl: './booking-done-page.css'
})
export class BookingDonePage implements OnInit, OnDestroy {

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

    /** popStateHandler */
    private popStateHandler = () => {
        this.router.navigateByUrl('/');
        history.pushState(null, '', location.href);
    };

    /**
     * 建構子注入
     */
    constructor(private router: Router, private bookService: BookService, private hotelService: HotelService, private messageService: MessageService, private chatService: ChatService) { };

    /**
     * 初始化頁面內容
     */
    ngOnInit(): void {

        history.pushState(null, '', location.href);
        window.addEventListener('popstate', this.popStateHandler);

        if (this.bookService.getSharedOrderData().propertyId === '') {
            if (!localStorage.getItem('sharedOrderData')) {
                this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '資料傳輸異常，將導回 PETEL 首頁' });
                this.router.navigateByUrl('/');
                return;
            }

            this.bookService.updatePayStatus(localStorage.getItem('sharedOrderId')!).subscribe({
                next: (response) => {
                    if (response.MWHEADER.RETURNCODE !== '0000') {
                        this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '資料傳輸異常，將導回 PETEL 首頁' });
                        this.router.navigateByUrl('/');
                        return;
                    }
                },
                error: (error) => {
                    this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '資料傳輸異常，將導回 PETEL 首頁' });
                    this.router.navigateByUrl('/');
                    return;
                }
            });

            this.bookService.setSharedOrderData(JSON.parse(localStorage.getItem('sharedOrderData')!));
        }

        this.chatService.onCreateChatRoomApi({
            MWHEADER: {
                MSGID: 'CHAT-001'
            },
            TRANRQ: {
                orderId: localStorage.getItem('sharedOrderId')!
            }
        }).subscribe();

        this.orderData = this.bookService.getSharedOrderData();

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
     * 頁面關閉後的業務邏輯
     */
    ngOnDestroy(): void {
        window.removeEventListener('popstate', this.popStateHandler);
        localStorage.removeItem('sharedOrderData');
        localStorage.removeItem('sharedOrderId');
    }

    /**
     * 點擊聊聊按鈕，轉導至聊天室頁面
     */
    onChat(): void {
        this.router.navigateByUrl('/chat');
    }

    /**
     * 點擊查看歷史訂單按鈕，轉導至會員資訊頁面
     */
    onViewHistory(): void {
        this.router.navigateByUrl('/history');
    }
}
