
import { BookService, OrderData } from './../../core/services/book-service';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { HotelService } from '../../core/services/hotel-service';
import { BOOK001Tranrq, OrderDetail, OrderInfo } from '../../core/interfaces/BOOK001Req.interface';
import { EditorModule } from 'primeng/editor';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PricePipe } from "../../shared/pipes/price-pipe";
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';

@Component({
    selector: 'app-booking-page',
    imports: [
        FormsModule,
        ButtonModule,
        IftaLabelModule,
        CarouselModule,
        ReactiveFormsModule,
        RadioButton,
        InputGroupModule,
        InputGroupAddonModule,
        InputTextModule,
        SelectModule,
        InputNumberModule,
        EditorModule,
        ButtonModule,
        PricePipe,
        CommonModule
    ],
    templateUrl: './booking-page.html',
    styleUrl: './booking-page.css'
})
export class BookingPage implements OnInit {

    // <div class="hotel_infos section-card">
    propertyName: string = '';
    propertyAddress: string = '';
    propertyTel: string = '';
    propertyInfo: string = '';

    // <div class="guest_infos section-card">
    memberName: string = '';
    memberEmail: string = '';
    memberPhone: string = '';

    // <div class="order_infos section-card">
    orderData: OrderData = {
        propertyId: '',
        checkIn: '',
        checkOut: '',
        rooms: []
    };

    // <div class="additional_infos section-card">
    checkNotice = '';
    petNotice = '';
    propertyNotice = '';

    // <div class="payment_options section-card">
    totalAmount = 0;
    paymentOptions = [
        { label: '現場付款', value: 'Y000000001', statement: '須提供信用卡資訊預先授權' },
        { label: '線上刷卡', value: 'Y000000002', statement: '信用卡一次付清（將轉導至綠界付款頁面）' }
    ];

    /** FormGroup */
    form = new FormGroup({
        guestType: new FormControl<string>('y'),
        guestName: new FormControl<string | null>(null),
        guestPhone: new FormControl<string | null>(null),
        note: new FormControl<string | null>(null),
        selectedPayment: new FormControl<string>('')
    });

    /** isNavigatingAway */
    isNavigatingAway: boolean = false;

    /**
     * 建構子注入
     */
    constructor(private router: Router, private hotelService: HotelService, private bookService: BookService, private messageService: MessageService, private userService: UserService) { };

    /**
     * 初始化頁面內容
     */
    ngOnInit(): void {

        this.bookService.setSharedOrderData({ // 暫時寫在這，應該要在上一頁設定
            propertyId: 'P000000001',
            checkIn: '2025-10-26',
            checkOut: '2025-10-27',
            rooms: [{
                roomId: 'R000000001',
                roomName: '高級寵物房',
                roomPrice: 2500,
                roomQuantity: 1,
                roomTotal: 2500,
                expanded: false
            }, {
                roomId: 'R000000002',
                roomName: '豪華寵物房',
                roomPrice: 2700,
                roomQuantity: 1,
                roomTotal: 2700,
                expanded: false
            }]
        });

        this.orderData = this.bookService.getSharedOrderData();

        if (!this.orderData) {
            this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '資料傳輸異常，將導回 PETEL 首頁' });
            this.router.navigateByUrl('/');
            return;
        }

        // 獲取會員資訊（已在 singlePage 驗證過登入狀態）
        this.userService.getUserInfo().subscribe({
            next: (response) => {
                if (response.MWHEADER.RETURNCODE === '0000') {
                    const tranrs = response.TRANRS;
                    this.memberName = tranrs.name;
                    this.memberEmail = tranrs.email;
                    this.memberPhone = tranrs.phone;
                }
            },
            error: (error) => {
                console.error('獲取會員資訊失敗:', error);
            }
        });

        this.hotelService.queryHotelDetail(this.orderData.propertyId).subscribe({

            next: (response) => {

                if (response.MWHEADER.RETURNCODE !== '0000') {
                    this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '旅館資訊異常，將導回 PETEL 首頁' });
                    this.router.navigateByUrl('/');
                }

                const propertyDetail = response.TRANRS.property_details.at(0);
                this.propertyName = propertyDetail!.name;
                this.propertyAddress = propertyDetail!.address;
                this.propertyTel = propertyDetail!.tel;
                this.propertyInfo = propertyDetail!.info;
                this.checkNotice = propertyDetail!.checkNotice;
                this.petNotice = propertyDetail!.petNotice;
                this.propertyNotice = propertyDetail!.propertyNotice;
            }
        });

        for (let room of this.orderData.rooms) {
            this.totalAmount += room.roomTotal;
        }
    }

    /**
     * 重置控制項狀態
     */
    cleanTouched(): void {
        this.guestName.markAsUntouched();
        this.guestPhone.markAsUntouched();
    }

    /**
     * 設定建立訂單的相關輸入參數
     * @returns 建立訂單的相關輸入參數
     */
    setDataForCreateOrder(): BOOK001Tranrq {
        const orderInfo: OrderInfo = {
            property_id: this.orderData.propertyId,
            payment_id: this.selectedPayment.value!,
            check_in: this.orderData.checkIn,
            check_out: this.orderData.checkOut,
            status: '未付款',
            guest: this.guestType.value!,
            guest_name: this.guestName.value,
            guest_phone: this.guestPhone.value,
            note: this.note.value
        }

        const orderDetails: OrderDetail[] = [];
        const dates: string[] = this.getDatesBetween(this.orderData.checkIn, this.orderData.checkOut);

        for (let item of this.orderData.rooms) {
            for (let date of dates) {
                orderDetails.push({
                    room_id: item.roomId,
                    arrival_date: date,
                    room_quantity: item.roomQuantity,
                    room_price: item.roomTotal
                })
            }
        }

        return {
            order_info: orderInfo,
            order_detail: orderDetails
        };
    }

    /**
     * 送出訂單
     */
    onSubmit(): void {

        if (this.guestType.value === 'n' && (this.guestName.value === null || this.guestPhone.value === null)) {
            this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '請填入主人姓名和電話' });
            return;
        }

        switch (this.selectedPayment.value) {

            case this.paymentOptions.at(0)?.value: {
                this.bookService.createOrder(this.setDataForCreateOrder()).subscribe({
                    next: (response) => {
                        if (!(response.MWHEADER.RETURNCODE === "0000")) {
                            this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '資料庫數據異常，無法送出訂單' });
                            return;
                        }
                        localStorage.setItem('sharedOrderId', response.TRANRS.order_id);
                        this.router.navigateByUrl('/book/authorize');
                    },
                    error: (error) => {
                        this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '資料庫數據異常，無法送出訂單' });
                        return;
                    }
                });
                break;
            }

            case this.paymentOptions.at(1)?.value: {

                localStorage.setItem('sharedOrderData', JSON.stringify(this.orderData)); // 加這一句因為轉導到綠界 service 資料會重置

                this.bookService.createOrder(this.setDataForCreateOrder()).subscribe({
                    next: (response) => {
                        if (!(response.MWHEADER.RETURNCODE === "0000")) {
                            this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '資料庫數據異常，無法送出訂單' });
                            return;
                        }
                        const orderId: string = response.TRANRS.order_id;
                        localStorage.setItem('sharedOrderId', orderId);

                        // 呼叫綠界信用卡API
                        this.bookService.getCreditParams(orderId).subscribe({
                            next: (response) => {

                                // 建立form
                                const form = document.createElement('form');
                                form.method = 'POST';
                                form.action = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';

                                // 將所有參數加入form的hidden input中
                                Object.entries(response.TRANRS.ecPay_params).forEach(([key, value]) => {
                                    const input = document.createElement('input');
                                    input.type = 'hidden';
                                    input.name = key;
                                    input.value = String(value);
                                    form.appendChild(input);
                                });

                                this.isNavigatingAway = true;

                                document.body.appendChild(form);
                                form.submit();
                            }
                        });
                    },
                    error: (error) => {
                        this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '資料庫數據異常，無法送出訂單' });
                        return;
                    }
                });
                break;
            }

            default: {
                this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '您需要選取一種付款方式' });
                break;
            }
        }
    }

    /**
     * 是否展開訂購房型的詳細資訊
     * @params index：第幾個訂購房型
     */
    toggleRoom(index: number): void {
        this.orderData.rooms[index].expanded = !this.orderData.rooms[index].expanded;
    }

    /**
     * 設定 selectedPayment 的值
     * @params value：selectedPayment.value，格式：'Y000000001'
     */
    selectPayment(value: string): void {
        this.form.get('selectedPayment')?.setValue(value);
    }

    /**
     * 獲取兩個日期之間的所有日期（包含起始日，不含結束日）
     * @params startDate：起始日，格式：'yyyy-MM-dd'
     * @params endDate：結束日，格式：'yyyy-MM-dd'
     * @returns 日期序列，如：['2025-10-22', '2025-10-23', '2025-10-24']
     */
    getDatesBetween(startDate: string, endDate: string): string[] {
        const dates = [];
        const currentDate = new Date(startDate);
        const stopDate = new Date(endDate);

        while (currentDate < stopDate) {
            dates.push(currentDate.toISOString().slice(0, 10));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }

    /**
     * 使用者如果要重整頁面，跳出警告
     * @params event
     */
    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHander(event: any): void {
        if (this.isNavigatingAway) {
            return;
        }
        event.preventDefault();
        event.returnValue = '您的預訂資訊可能會遺失，請問確認要重整此頁嗎？';
    }

    // 簡化取得控制項：beginning
    get guestType() {
        return this.form.controls.guestType;
    }

    get guestName() {
        return this.form.controls.guestName;
    }

    get guestPhone() {
        return this.form.controls.guestPhone;
    }

    get note() {
        return this.form.controls.note;
    }

    get selectedPayment() {
        return this.form.controls.selectedPayment;
    }
    // 簡化取得控制項：ending
}
