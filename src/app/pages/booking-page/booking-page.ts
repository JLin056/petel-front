import { Component, OnInit } from '@angular/core';
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

@Component({
    selector: 'app-booking-page',
    imports: [FormsModule, ButtonModule, DatePicker, FloatLabel, IftaLabelModule, CarouselModule, FormsModule, ReactiveFormsModule, RadioButton, InputGroupModule, InputGroupAddonModule, InputTextModule, SelectModule, InputNumberModule],
    templateUrl: './booking-page.html',
    styleUrl: './booking-page.css'
})
export class BookingPage implements OnInit {
    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }

    isSameGuest: boolean = true;
    propertyName = '';
    propertyAddress = '';
    propertyTel = '';
    memberName = 'a';
    memberEmail = 'b';
    memberPhone = 'c';
    lengthOfStay = '';
    roomName = '';
    roomQuantity = '';
    roomPrice = '';

    form = new FormGroup({
        checkIn: new FormControl<Date>(new Date()),
        checkOut: new FormControl<Date>(new Date()),
        lengthOfStay: new FormControl<string>(''),
        guestType: new FormControl<string>('memberInfo'),
        guestName: new FormControl<string>(''),
        guestPhone: new FormControl<string>(''),
        note: new FormControl<string>(''),
        payments: new FormArray<FormControl<string>>([])
    });

    paymentSelect = [
        { label: '現場付款', value: 'Y000000001' },
        { label: '線上刷卡', value: 'Y000000002' }
    ];


    onSubmit() {

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

    get payments() {
        return this.form.controls.payments;
    }

}
