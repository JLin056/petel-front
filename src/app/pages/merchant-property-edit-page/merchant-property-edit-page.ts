import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MerchService } from '../../core/services/merch-service';
import { Router } from '@angular/router';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';

@Component({
  selector: 'app-merchant-property-edit-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // 改這裡，使用 reactive form
    InputTextModule,
    ButtonModule,
    SharedConfirmDialog
  ],
  templateUrl: './merchant-property-edit-page.html',
  styleUrl: './merchant-property-edit-page.css'
})
export class MerchantPropertyEditPage implements OnInit {
  propertyForm!: FormGroup;
  cancelConfirmVisible = false;
  isSubmitting = false;
  errorMessage = '';
  propertyData: any = null;
  propertyId = '';

  constructor(
    private fb: FormBuilder,
    private merchService: MerchService,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.propertyData = navigation.extras.state['property'];
      this.propertyId = this.propertyData?.id || '';
      console.log('接收到的旅館資料:', this.propertyData);
    }
  }

  ngOnInit(): void {
    this.initForm();
    if (!this.propertyData || !this.propertyId) {
      this.errorMessage = '無法取得旅館資料';
      setTimeout(() => this.router.navigate(['/merchants/property/homepage']), 2000);
      return;
    }
    this.populateForm();
  }

  private initForm(): void {
    this.propertyForm = this.fb.group({
      name: ['', Validators.required],
      businessCode: [{ value: '', disabled: true }],
      bankAccount: ['', Validators.required],
      tel: ['', Validators.required],
      address: ['', Validators.required],
      info: ['', Validators.required],
      checkNotice: ['', Validators.required],
      petNotice: ['', Validators.required],
      propertyNotice: ['']
    });
  }

  private populateForm(): void {
    if (!this.propertyData) return;
    this.propertyForm.patchValue({
      name: this.propertyData.name || '',
      businessCode: this.propertyData.businessCode || '',
      bankAccount: this.propertyData.bankAccount || '',
      tel: this.propertyData.tel || '',
      address: this.propertyData.address || '',
      info: this.propertyData.info || '',
      checkNotice: this.propertyData.checkNotice || '',
      petNotice: this.propertyData.petNotice || '',
      propertyNotice: this.propertyData.propertyNotice || '',
    });
  }

  onSubmit(): void {
    if (this.propertyForm.invalid) {
      this.errorMessage = '請填寫所有必填欄位';
      this.propertyForm.markAllAsTouched();
      return;
    }

    const formData = this.propertyForm.value;
    const tranrq = {
      id: this.propertyId,
      sellerId: this.propertyData.sellerId,
      ...formData
    };

    this.isSubmitting = true;
    this.merchService.editHotelDetail(tranrq).subscribe({
      next: (res) => {
        if (res.MWHEADER.RETURNCODE === '0000') {
          this.router.navigate(['/merchants/property/info']);
        } else {
          this.errorMessage = '修改失敗';
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('API 錯誤:', err);
        this.errorMessage = '伺服器錯誤';
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
