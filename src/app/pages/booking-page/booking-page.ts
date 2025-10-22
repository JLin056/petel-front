import { BookService } from './../../core/services/book-service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { HotelService } from '../../core/services/hotel-service';
import { BOOK001Tranrq, OrderDetail, OrderInfo } from '../../core/interfaces/BOOK001Req.interface';
import { HttpClient } from '@angular/common/http';
import { EditorModule } from 'primeng/editor';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Auth } from '../../core/services/auth.service';
import { PricePipe } from "../../shared/pipes/price-pipe";

@Component({
    selector: 'app-booking-page',
    imports: [FormsModule, ButtonModule, DatePicker, FloatLabel, IftaLabelModule, CarouselModule, FormsModule, ReactiveFormsModule, RadioButton, InputGroupModule, InputGroupAddonModule, InputTextModule, SelectModule, InputNumberModule, EditorModule, ButtonModule, PricePipe],
    templateUrl: './booking-page.html',
    styleUrl: './booking-page.css'
})
export class BookingPage implements OnInit {

    // 旅館相關屬性
    propertyName = '';
    propertyTel = '';
    propertyAddress = '';
    propertyInfo = '';
    checkNotice = '';
    petNotice = '';
    propertyNotice = '';
    // 其餘無法在這個頁面被用戶編輯的屬性
    totalAmount = 2500;
    memberName = 'William Huang';
    memberEmail = 'asdfg@gmail.com';
    memberPhone = '0912345678';
    roomName = '超大型犬尊榮套房';
    roomPrice = 2500;
    roomQuantity = 1;
    selectedPayment = '';
    checkIn = '2025-10-22';
    checkOut = '2025-10-23';
    totalPrice = 2500;
    // 只有兩筆資料，直接在前端建資料
    paymentOptions = [
        { label: '現場付款', value: 'Y000000001', statement: '須提供信用卡資訊預先授權' },
        { label: '線上刷卡', value: 'Y000000002', statement: '信用卡一次付清（將轉導至綠界付款頁面）' }
    ];

    form = new FormGroup({
        // 日期相關
        rangeDates: new FormControl<Date[]>([new Date(), this.getTomorrowDate()]),
        lengthOfStay: new FormControl<string>('1'),
        // 訂單相關
        roomQuantity: new FormControl<number>(0),
        // 入住者相關
        guestType: new FormControl<string>('y'),
        guestName: new FormControl<string | null>(null),
        guestPhone: new FormControl<string | null>(null),
        // 其他
        note: new FormControl<string>(''),
        selectedPayment: new FormControl<string>('')
    });

    constructor(private hotelService: HotelService, private bookService: BookService, private http: HttpClient, private router: Router, private messageService: MessageService, private authService: Auth) { };

    ngOnInit(): void {
        this.hotelService.queryHotelDetail('P000000001').subscribe({ // 暫時使用固定的旅館編號
            next: (response) => {

                if (response.MWHEADER.RETURNCODE !== '0000') {
                    return;
                }

                const propertyDetail = response.TRANRS.property_details.at(0);
                this.propertyName = propertyDetail!.name;
                this.propertyTel = propertyDetail!.tel;
                this.propertyAddress = propertyDetail!.address;
                this.propertyInfo = propertyDetail!.info;
                this.checkNotice = propertyDetail!.checkNotice;
                this.petNotice = propertyDetail!.petNotice;
                this.propertyNotice = propertyDetail!.propertyNotice;
            }
        });
    }



    setDataForCreateOrder() {
        const orderInfo: OrderInfo = {
            // user_id: 'U000000001',
            property_id: 'P000000001',
            // payment_id: this.selectedPayment,
            payment_id: 'Y000000002',
            check_in: this.dateToString(this.form.controls.rangeDates.value!.at(0)!),
            check_out: this.dateToString(this.form.controls.rangeDates.value!.at(-1)!),
            status: '未付款',
            guest: this.form.controls.guestType.value!,
            guest_name: this.form.controls.guestName.value,
            guest_phone: this.form.controls.guestPhone.value,
            note: this.form.controls.note.value
        }

        const orderDetails: OrderDetail[] = [{ // 先使用假資料
            room_id: 'R000000001',
            arrival_date: this.dateToString(this.form.controls.rangeDates.value!.at(0)!),
            room_quantity: 1,
            room_price: 1
        }]

        const tranrq: BOOK001Tranrq = {
            order_info: orderInfo,
            order_detail: orderDetails
        };

        return tranrq
    }

    onSubmit() {


        console.log(this.authService.onLoginApi({
            MWHEADER: { MSGID: 'AUTH-002' },
            TRANRQ: {
                email: 'kai@test.com',
                password: '88888888',
                role: 'USER'
            }
        }));

        switch (this.form.controls.selectedPayment.value) {

            case this.paymentOptions.at(0)?.value: {
                this.bookService.createOrder(this.setDataForCreateOrder()).subscribe({
                    next: (response) => {
                        if (response.MWHEADER.RETURNCODE !== "0000") {
                            return;
                        }
                    }
                });
                // 把資料帶過去
                this.router.navigateByUrl('/book/authorize');
                break;
            }

            case this.paymentOptions.at(1)?.value: {
                console.log('test2');
                this.bookService.createOrder(this.setDataForCreateOrder()).subscribe({
                    next: (response) => {
                        if (response.MWHEADER.RETURNCODE !== "0000") {
                            return;
                        }
                        // 下方是呼叫綠界信用卡API：可能還需要修
                        this.bookService.getCreditParams(response.TRANRS.order_id).subscribe({
                            // this.bookService.getCreditParams('O000000007').subscribe({
                            next: (response) => {

                                const params = response.TRANRS.ecPay_params;

                                // 建立form
                                const form = document.createElement('form');
                                form.method = 'POST';
                                form.action = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';

                                // 將所有參數加入form的hidden input中
                                Object.entries(params).forEach(([key, value]) => {
                                    const input = document.createElement('input');
                                    input.type = 'hidden';
                                    input.name = key;
                                    input.value = String(value);
                                    form.appendChild(input);
                                });

                                document.body.appendChild(form);
                                form.submit();
                            }
                        });
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

    dateToString(date: Date): string {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }

    getTomorrowDate(): Date {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    }
}
