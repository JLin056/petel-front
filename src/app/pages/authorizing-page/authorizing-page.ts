import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router';

@Component({
    selector: 'app-authorizing-page',
    imports: [FormsModule, ReactiveFormsModule, InputTextModule, ButtonModule, CheckboxModule, CardModule, DividerModule, PanelModule ],
    templateUrl: './authorizing-page.html',
    styleUrl: './authorizing-page.css'
})
export class AuthorizingPage {

    constructor(private router: Router) {};

    form = new FormGroup({});

    onSubmit() {
        this.router.navigateByUrl('/book/finish');
    }

    booking = {
        orderId: 'O000000001',
        hotelCharges: 2500,
        detail: [
            {
                arrivalDate: '2025-10-22',
                roomId: 'R000000001',
                quantity: 1,
                price: 2500
            }
        ]
    }

    bookings = [this.booking];

    totalAmount = 2500;
}
