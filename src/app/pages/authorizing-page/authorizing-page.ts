import { BookService } from './../../core/services/book-service';
import { Component } from '@angular/core';
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
export class AuthorizingPage {

    constructor(private router: Router, private bookService: BookService) { }

    form = new FormGroup({
        cardName: new FormControl<string>('', Validators.required),
        cardPhone: new FormControl<string>('', Validators.required),
        cardNo: new FormControl<string>('', Validators.required),
        cardCVV2: new FormControl<string>('', Validators.required),
        cardValidMM: new FormControl<string>('', Validators.required),
        cardValidYY: new FormControl<string>('', Validators.required)
    });

    // 訂單資訊
    checkIn: string = '2025-10-22';
    checkOut: string = '2025-10-25';

    roomsData: RoomData[] = [
        {
            roomName: '豪華雙人房',
            roomPrice: 2500,
            roomQuantity: 1,
            roomTotal: 2500,
            expanded: false
        }
    ];

    totalAmount: number = 2500;

    toggleRoom(index: number) {
        this.roomsData[index].expanded = !this.roomsData[index].expanded;
    }

    onSubmit(): void {

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
            order_id: this.orderId,
            card_info: cardInfo,
            consumer_info: consumerInfo
        }).subscribe({
            next: (response) => {
                if (response.MWHEADER.RETURNCODE !== '0000') {
                    return; // TODO Think: how to do?
                }
                this.router.navigateByUrl('/book/finish');
            }
        });
    }

    orderId = '';

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
}

interface RoomData {
    roomName: string;
    roomPrice: number;
    roomQuantity: number;
    roomTotal: number;
    expanded: boolean;
}
