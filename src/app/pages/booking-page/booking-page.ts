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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EditorModule } from 'primeng/editor';

@Component({
    selector: 'app-booking-page',
    imports: [FormsModule, ButtonModule, DatePicker, FloatLabel, IftaLabelModule, CarouselModule, FormsModule, ReactiveFormsModule, RadioButton, InputGroupModule, InputGroupAddonModule, InputTextModule, SelectModule, InputNumberModule, EditorModule],
    templateUrl: './booking-page.html',
    styleUrl: './booking-page.css'
})
export class BookingPage implements OnInit {

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

    constructor(private hotelService: HotelService, private bookService: BookService, private http: HttpClient) { };

    ngOnInit(): void {
        this.hotelService.queryHotelDetail('P000000001').subscribe({ // 暫時使用假資料
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

    // 旅館相關屬性：begin

    propertyName = '';
    propertyTel = '';
    propertyAddress = '';
    propertyInfo = '';
    checkNotice = '';
    petNotice = '';
    propertyNotice = '';

    // 旅館相關屬性：end

    totalAmount = 800;
    memberName = 'William Huang';
    memberEmail = 'asdfg@gmail.com';
    memberPhone = '0912345678';
    roomName = '超大型犬尊榮套房';
    roomPrice = 2500;
    roomQuantity = 1;
    selectedPayment = '';
    maxNumOfRooms = 10;

    paymentOptions = [
        { label: '現場付款', value: 'Y000000001', statement: '須提供信用卡資訊預先授權' },
        { label: '線上刷卡', value: 'Y000000002', statement: '信用卡一次付清（將轉導至綠界付款頁面）' }
    ];

    setDataForCreateOrder() {
        const orderInfo: OrderInfo = {
            user_id: 'U000000001',
            property_id: 'P000000001',
            payment_id: this.selectedPayment,
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
        this.setDataForCreateOrder();
        this.bookService.createOrder(this.setDataForCreateOrder()).subscribe({
            next: (response) => {
                if (response.MWHEADER.RETURNCODE !== "0000") {
                    return;
                }
                // 下方是呼叫綠界信用卡API：可能還需要修
                this.bookService.getCreditParams(response.TRANRS.order_id).subscribe({
                    next: (response) => {

                        const params = response.TRANRS.ecPay_params;

                        // 建立form
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';

                        // 將所有參數加入form的hidden input中
                        // for (const key in params) {
                        //     if (params.hasOwnProperty(key)) {
                        //         const input = document.createElement('input');
                        //         input.type = 'hidden';
                        //         input.name = key;
                        //         input.value = params[key];
                        //         form.appendChild(input);
                        //     }
                        // }

                        Object.entries(params).forEach(([key, value]) => {
                            const input = document.createElement('input');
                            input.type = 'hidden';
                            input.name = key;
                            input.value = String(value); // 確保值是字串
                            form.appendChild(input);
                        });

                        document.body.appendChild(form);
                        form.submit(); // 送出表單後跳轉至綠界付款頁

                        // const body = new URLSearchParams();
                        // const params = response.TRANRS.ecPay_params;
                        // body.set('MerchantID', params.MerchantID);
                        // body.set('MerchantTradeNo', params.MerchantTradeNo);
                        // body.set('MerchantTradeDate', params.MerchantTradeDate);
                        // body.set('PaymentType', params.PaymentType);
                        // body.set('TotalAmount', params.TotalAmount.toString());
                        // body.set('TradeDesc', params.TradeDesc);
                        // body.set('ItemName', params.ItemName);
                        // body.set('ReturnURL', params.ReturnURL);
                        // body.set('ChoosePayment', params.ChoosePayment);
                        // body.set('CheckMacValue', params.CheckMacValue);
                        // body.set('EncryptType', params.EncryptType.toString());

                        // const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

                        // this.http.post('https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5', body.toString(), { headers });
                    }
                });
            }
        });
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
