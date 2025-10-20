import { Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

// PrimeNG 元件模組
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    selector: 'app-authorizing-page',
    imports: [BrowserModule,
        FormsModule,
        PanelModule,
        InputTextModule,
        ButtonModule,
        CheckboxModule
    ],
    templateUrl: './authorizing-page.html',
    styleUrl: './authorizing-page.css'
})
export class AuthorizingPage {
    // 信用卡有效月份
    months = [
        { label: '01', value: '01' }, { label: '02', value: '02' },
        { label: '03', value: '03' }, { label: '04', value: '04' },
        { label: '05', value: '05' }, { label: '06', value: '06' },
        { label: '07', value: '07' }, { label: '08', value: '08' },
        { label: '09', value: '09' }, { label: '10', value: '10' },
        { label: '11', value: '11' }, { label: '12', value: '12' }
    ];

    // 信用卡有效年份（當前年份起20年，可依實際需要調整)
    years = Array.from({ length: 20 }, (_, i) => {
        const year = new Date().getFullYear() + i;
        return { label: year.toString(), value: year.toString() };
    });

    // 資料繫結欄位
    cardHolder = '';
    cardNum = '';
    expMonth = '';
    expYear = '';
    cvv = '';
    agreed = false;

    // 假設訂單資訊
    hotelName = 'Petel_Name';
    rating = 4.5;
    reviewCount = 120;
    checkIn = '2025/10/21 日 14:00';
    checkOut = '2025/10/23 日 12:00';
    roomCount = 1;
    nightCount = 2;
    amount = 800;
    userEmail = 'abcd@gmail.com';

    // 點擊預訂按鈕
    onSubmit() {
        // 實際可串接 API 將資料送出
        if (!this.cardHolder || !this.cardNum || !this.expMonth || !this.expYear || !this.cvv) {
            alert('請填完整信用卡資料');
            return;
        }
        if (!this.agreed) {
            alert('請勾選同意訂購注意事項');
            return;
        }
        // 送出資料的程式，可串接付款API
        alert('資料送出，進行信用卡預授權！');
    }
}
