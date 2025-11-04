import { MessageService } from 'primeng/api';
import { BookService, OrderData } from './../../core/services/book-service';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router';
import { PricePipe } from "../../shared/pipes/price-pipe";
import { CommonModule } from '@angular/common';
import { BOOK005TranrqCardInfo, BOOK005TranrqConsumerInfo } from '../../core/interfaces/BOOK005Req.interface';

@Component({
    selector: 'app-authorizing-page',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        CheckboxModule,
        CardModule,
        DividerModule,
        PanelModule,
        PricePipe
    ],
    templateUrl: './authorizing-page.html',
    styleUrl: './authorizing-page.css'
})
export class AuthorizingPage implements OnInit, OnDestroy {

    /** 訂單編號 */
    orderId: string | null = null;

    /** 訂購天數 */
    orderDays: number = 0;

    /** 訂單總金額 */
    totalAmount: number = 0;

    /** 訂單資訊 */
    orderData: OrderData = {
        propertyId: '',
        checkIn: '',
        checkOut: '',
        rooms: []
    };

    /** FormGroup */
    form = new FormGroup({
        cardName: new FormControl<string>('', Validators.required),
        cardPhone: new FormControl<string>('', [Validators.required, Validators.pattern(/^\d+$/)]),
        cardNo: new FormControl<string>('', [Validators.required, Validators.pattern(/^\d{4}-\d{4}-\d{4}-\d{4}$/)]),
        cardCVV2: new FormControl<string>('', [Validators.required, Validators.pattern(/^\d+$/)]),
        cardValidMM: new FormControl<string>('', Validators.required),
        cardValidYY: new FormControl<string>('', Validators.required)
    });

    /** popStateHandler */
    private popStateHandler = () => {
        this.router.navigateByUrl('/');
        history.pushState(null, '', location.href);
    };

    /**
     * 建構子注入
     */
    constructor(private router: Router, private bookService: BookService, private messageService: MessageService) { }

    /**
     * 初始化頁面內容
     */
    ngOnInit(): void {

        this.orderDays = history.state.orderDays;
        this.orderId = localStorage.getItem('sharedOrderId');
        this.orderData = this.bookService.getSharedOrderData();

        if (!(this.orderDays && this.orderId && this.orderData)) {
            this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '資料傳輸異常，將導回 PETEL 首頁' });
            this.router.navigateByUrl('/');
        }

        this.totalAmount = 0;

        for (let room of this.orderData.rooms) {
            this.totalAmount += room.roomTotal * this.orderDays;
        }

        history.pushState(null, '', location.href);
        window.addEventListener('popstate', this.popStateHandler);
    }

    /**
     * 頁面關閉後的業務邏輯
     */
    ngOnDestroy(): void {
        window.removeEventListener('popstate', this.popStateHandler);
    }

    /**
     * 格式化輸入的信用卡卡號：滿足 'XXXX-XXXX-XXXX-XXXX' 的格式
     * @params event：輸入事件
     */
    formatCardNumber(event: Event): void {

        const input = event.target as HTMLInputElement;
        let value = input.value.replace(/\D/g, '');

        // 限制最多16位數字
        if (value.length > 16) {
            value = value.substring(0, 16);
        }
        // 每4位數字加一個 '-'
        const formatted = value.match(/.{1,4}/g)?.join('-') || value;
        // 更新表單控制項的值
        this.form.get('cardNo')?.setValue(formatted, { emitEvent: false });
    }

    /**
     * 檢查信用卡是否過期
     */
    isExpired(): boolean {

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        const cardYear = parseInt(this.cardValidYY.value || '0');
        const cardMonth = parseInt(this.cardValidMM.value || '0');

        if (cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth)) {
            this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '您的信用卡已過期，請換一張信用卡' });
            return true;
        }
        return false;
    }

    /**
     * 是否展開訂購房型的詳細資訊
     * @params index：第幾個訂購房型
     */
    toggleRoom(index: number) {
        this.orderData.rooms[index].expanded = !this.orderData.rooms[index].expanded;
    }

    /**
     * 送出授權
     */
    onSubmit(): void {

        if (this.form.invalid) {
            this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '請確認表單所有欄位皆已填寫並且格式正確' });
            return;
        }

        if (this.isExpired()) {
            return;
        }

        const cardInfo: BOOK005TranrqCardInfo = {
            card_no: this.cardNo.value!,
            card_valid_mm: this.cardValidMM.value!,
            card_valid_yy: this.cardValidYY.value!,
            card_cvv_2: this.cardCVV2.value!
        }
        const consumerInfo: BOOK005TranrqConsumerInfo = {
            phone: this.cardPhone.value!,
            name: this.cardName.value!
        }

        this.bookService.getAuthorizeParams({
            order_id: this.orderId!,
            card_info: cardInfo,
            consumer_info: consumerInfo
        }).subscribe({
            next: (response) => {
                if (response.MWHEADER.RETURNCODE !== '0000') {
                    this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '送出授權有問題，請稍後再試' });
                    return;
                }
                this.router.navigateByUrl('/book/finish');
            },
            error: (error) => {
                this.messageService.add({ severity: 'warn', summary: 'Warn', detail: '送出授權有問題，請稍後再試' });
                return;
            }
        });
    }

    /**
    * 使用者如果要重整頁面，跳出警告
    * @params event
    */
    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHander(event: any): void {
        event.preventDefault();
        event.returnValue = '您的預訂資訊可能會遺失，請問確認要重整此頁嗎？';
    }

    /**
     * for Demo 用的 按鈕
     */
    fillDemoCard(): void {
        this.form.patchValue({
            cardName: 'Lin Huang Lin',
            cardPhone: '0923532697',
            cardNo: '4134-6345-5864-4311',
            cardCVV2: '232',
            cardValidMM: '12',
            cardValidYY: '30'
        });

        // 讓驗證狀態立刻更新
        this.form.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    }

    // 簡化取得控制項：beginning
    get cardName() {
        return this.form.controls.cardName;
    }

    get cardPhone() {
        return this.form.controls.cardPhone;
    }

    get cardNo() {
        return this.form.controls.cardNo;
    }

    get cardCVV2() {
        return this.form.controls.cardCVV2;
    }

    get cardValidMM() {
        return this.form.controls.cardValidMM;
    }

    get cardValidYY() {
        return this.form.controls.cardValidYY;
    }
    // 簡化取得控制項：ending
}
