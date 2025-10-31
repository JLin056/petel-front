import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MERCH007Tranrq } from '../../core/interfaces/MERCH007Req.interface';
import { MerchService } from '../../core/services/merch-service';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';
import { HotelService } from './../../core/services/hotel-service';

@Component({
    selector: 'app-merchant-property-edit-page',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        SharedConfirmDialog
    ],
    templateUrl: './merchant-property-edit-page.html',
    styleUrl: './merchant-property-edit-page.css'
})
export class MerchantPropertyEditPage {

    propertyForm: FormGroup;
    cancelConfirmVisible = false;
    isSubmitting = false;
    errorMessage = '';
    propertyData: any = null;
    propertyId = '';

    constructor(
        private fb: FormBuilder,
        private merchService: MerchService,
        private router: Router,
        private hotelService: HotelService
    ) {
        this.propertyForm = this.fb.group({
            name: ['', Validators.required],
            businessCode: [{ value: '', disabled: true }],
            bankAccount: ['', Validators.required],
            tel: ['', Validators.required],
            city: ['', Validators.required],
            district: ['', Validators.required],
            address: ['', Validators.required],
            info: ['', Validators.required],
            checkNotice: ['', Validators.required],
            petNotice: ['', Validators.required],
            propertyNotice: [''],
            facilities: [[]]
        });

        const navigation = this.router.getCurrentNavigation();

        if (navigation?.extras?.state) {
            this.propertyId = navigation.extras.state['property']?.id || '';
            this.hotelService.querySingleHotelDetailForMerchant(this.propertyId).subscribe({
                next: (response) => {
                    if (response.MWHEADER.RETURNCODE === '0000') {
                        this.propertyData = response.TRANRS.singleHotelDetail;
                        this.propertyForm.patchValue({
                            name: this.propertyData.name || '',
                            businessCode: this.propertyData.businessCode || '',
                            bankAccount: this.propertyData.bankAccount || '',
                            tel: this.propertyData.tel || '',
                            city: this.propertyData.city || '',
                            district: this.propertyData.district || '',
                            address: this.propertyData.address || '',
                            facilities: this.propertyData.facilities || '',
                            info: this.propertyData.info || '',
                            checkNotice: this.propertyData.checkNotice || '',
                            petNotice: this.propertyData.petNotice || '',
                            propertyNotice: this.propertyData.propertyNotice || '',
                        });
                    } else {
                        setTimeout(() => this.router.navigate(['/merchants/property/homepage']), 2000);
                    }
                },
                error: (error) => {
                    console.error('獲取資訊失敗:', error);
                    setTimeout(() => this.router.navigate(['/merchants/property/homepage']), 2000);
                }
            })
        }
    }

    onSubmit(): void {
        if (this.propertyForm.invalid) {
            this.errorMessage = '請填寫所有必填欄位';
            this.propertyForm.markAllAsTouched();
            return;
        }

        // const formData = this.propertyForm.value;
        // const tranrq = {
        //     id: this.propertyId,
        //     sellerId: this.propertyData.sellerId,
        //     ...formData
        // };
        const tranrq: MERCH007Tranrq = {
            id: this.propertyId,
            tel: this.propertyForm.controls['tel'].value,
            city: this.propertyForm.controls['city'].value,
            district: this.propertyForm.controls['district'].value,
            addressDetail: this.propertyForm.controls['district'].value,
            bankAccount: this.propertyForm.controls['bankAccount'].value,
            info: this.propertyForm.controls['info'].value,
            checkNotice: this.propertyForm.controls['checkNotice'].value,
            petNotice: this.propertyForm.controls['petNotice'].value,
            propertyNotice: this.propertyForm.controls['propertyNotice'].value,
            facilities: this.propertyForm.controls['facilities'].value,
            propertyImages: []
        };

        this.isSubmitting = true;
        this.merchService.editHotelDetail(tranrq).subscribe({
            next: (res) => {
                if (res.MWHEADER.RETURNCODE === '0000') {
                    this.router.navigate(['/merchants/property/info']);
                }
                this.isSubmitting = false;
            },
            error: (err) => {
                console.error('API 錯誤:', err);
                this.isSubmitting = false;
            }
        });
    }

    onCancelClick(): void {
        if (this.propertyForm.dirty) {
            this.cancelConfirmVisible = true;
        } else {
            this.onCancelConfirm();
        }
    }

    onCancelConfirm(): void {
        this.cancelConfirmVisible = false;
        this.router.navigate(['/merchants/property/info']);
    }

    onCancelCancel(): void {
        this.cancelConfirmVisible = false;
    }
}
