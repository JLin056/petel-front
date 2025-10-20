import { EcPayParams } from './../../core/interfaces/BOOK006Res.interface';
import { BookService } from './../../core/services/book-service';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-booking-page',
    imports: [FormsModule, ButtonModule, DatePicker, FloatLabel, IftaLabelModule, CarouselModule, FormsModule, ReactiveFormsModule, RadioButton, InputGroupModule, InputGroupAddonModule, InputTextModule, SelectModule, InputNumberModule],
    templateUrl: './booking-page.html',
    styleUrl: './booking-page.css'
})
export class BookingPage implements OnInit {

    // formGroup 相關屬性：start

    form = new FormGroup({
        note: new FormControl<string>(''),
        payments: new FormArray<FormControl<string>>([]),
        dateFormGroup: new FormGroup({}),
        orderFormGroup: new FormGroup({}),
        guestFormGroup: new FormGroup({}),
        selectedPayment: new FormControl<string>('')
    });

    dateFormGroup = new FormGroup({
        checkIn: new FormControl<Date>(new Date()),
        checkOut: new FormControl<Date>(new Date()),
        lengthOfStay: new FormControl<string>(''),
    });

    orderFormGroup = new FormGroup({
        roomQuantity: new FormControl<number>(0)
    });

    guestFormGroup = new FormGroup({
        guestType: new FormControl<string>('y'),
        guestName: new FormControl<string | null>(null),
        guestPhone: new FormControl<string | null>(null)
    });

    // formGroup 相關屬性：end

    http = inject(HttpClient);

    constructor(private hotelService: HotelService, private bookService: BookService, private httpClient: HttpClient) { };

    ngOnInit(): void {
        this.hotelService.queryHotelDetail('P000000001').subscribe({ // 暫時使用假資料
            next: (response) => {

                if (!response.TRANRS) {
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




    isSameGuest: boolean = true;
    totalAmount = 800;
    memberName = 'a';
    memberEmail = 'b';
    memberPhone = 'c';
    lengthOfStay = '';
    roomName = '';
    roomPrice = 0;
    roomQuantity = 0;
    selectedPayment = '';
    maxNumOfRooms = 10;




    setGuestInfo() {
        if (this.guestFormGroup.controls.guestType.value === 'y') {
            this.guestFormGroup.setValue({
                guestType: 'y',
                guestName: null,
                guestPhone: null
            });
        } else {
            this.guestFormGroup.setValue({
                guestType: 'n',
                guestName: this.guestFormGroup.controls.guestName.value,
                guestPhone: this.guestFormGroup.controls.guestPhone.value
            });
        }
    }


    paymentOptions = [
        { label: '現場付款', value: 'Y000000001', statement: '須提供信用卡資訊預先授權' },
        { label: '線上刷卡', value: 'Y000000002', statement: '信用卡一次付清（將轉導至綠界付款頁面）' }
    ];

    setDataForCreateOrder() {
        const orderInfo: OrderInfo = {
            user_id: 'U000000001',
            property_id: 'P000000001',
            payment_id: this.selectedPayment,
            check_in: this.dateToString(this.dateFormGroup.controls.checkIn.value!),
            check_out: this.dateToString(this.dateFormGroup.controls.checkOut.value!),
            status: '未付款',
            guest: this.guestFormGroup.controls.guestType.value!,
            guest_name: this.guestFormGroup.controls.guestName.value,
            guest_phone: this.guestFormGroup.controls.guestPhone.value,
            note: this.form.controls.note.value
        }

        const orderDetails: OrderDetail[] = [{ // 先使用假資料
            room_id: 'R000000001',
            arrival_date: this.dateToString(this.dateFormGroup.controls.checkIn.value!),
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
        this.setGuestInfo();
        this.setDataForCreateOrder();
        this.bookService.createOrder(this.setDataForCreateOrder()).subscribe({
            next: (response) => {
                if (response.MWHEADER.RETURNCODE !== "0000") {
                    return;
                }
                // 下方是呼叫綠界信用卡API
                this.bookService.getCreditParams(response.TRANRS.order_id).subscribe({
                    next: (response) => {
                        const body = new URLSearchParams();
                        const params = response.TRANRS.ecPay_params;
                        body.set('MerchantID', params.MerchantID);
                        body.set('MerchantTradeNo', params.MerchantTradeNo);
                        body.set('MerchantTradeDate', params.MerchantTradeDate);
                        body.set('PaymentType', params.PaymentType);
                        body.set('TotalAmount', params.TotalAmount.toString());
                        body.set('TradeDesc', params.TradeDesc);
                        body.set('ItemName', params.ItemName);
                        body.set('ReturnURL', params.ReturnURL);
                        body.set('ChoosePayment', params.ChoosePayment);
                        body.set('CheckMacValue', params.CheckMacValue);
                        body.set('EncryptType', params.EncryptType.toString());

                        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

                        this.http.post('https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5', body.toString(), { headers });
                    }
                });
            }
        });

    }

    dateToString(date: Date) {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
}
