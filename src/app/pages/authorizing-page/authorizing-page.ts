import { BookService, OrderData } from './../../core/services/book-service';
import { Component, OnInit } from '@angular/core';
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
export class AuthorizingPage implements OnInit {

    orderId = '';

    totalAmount: number = 0;

    orderData: OrderData = {
        propertyId: '',
        checkIn: '',
        checkOut: '',
        rooms: []
    };

    form = new FormGroup({
        cardName: new FormControl<string>('', Validators.required),
        cardPhone: new FormControl<string>('', Validators.required),
        cardNo: new FormControl<string>('', Validators.required),
        cardCVV2: new FormControl<string>('', Validators.required),
        cardValidMM: new FormControl<string>('', Validators.required),
        cardValidYY: new FormControl<string>('', Validators.required)
    });

    constructor(private router: Router, private bookService: BookService) { }

    ngOnInit(): void {
        this.orderId = history.state.orderId;
        this.orderData = this.bookService.getSharedOrderData();
        for (let room of this.orderData.rooms) {
            this.totalAmount += room.roomTotal;
        }
    }

    toggleRoom(index: number) {
        this.orderData.rooms[index].expanded = !this.orderData.rooms[index].expanded;
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
