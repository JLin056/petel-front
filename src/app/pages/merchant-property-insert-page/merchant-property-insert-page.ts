import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';
import { SelectModule } from 'primeng/select';
import { MerchService } from '../../core/services/merch-service';
import { Router } from '@angular/router';

interface CityDistrict {
  city: string;
  districts: string[];
}

@Component({
  selector: 'app-merchant-property-insert-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, SharedConfirmDialog],
  templateUrl: './merchant-property-insert-page.html',
  styleUrls: ['./merchant-property-insert-page.css']
import { UploadImg } from "../../shared/sharedComponents/upload-img/upload-img";

@Component({
  selector: 'app-merchant-property-insert-page',
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, UploadImg],
  templateUrl: './merchant-property-insert-page.html',
  styleUrl: './merchant-property-insert-page.css',
})
export class MerchantPropertyInsertPage implements OnInit {
  propertyForm!: FormGroup;
  cancelConfirmVisible = false;
  isSubmitting = false;
  errorMessage = '';
  propertyData: any = null;
  cities: { city: string, districts: string[] }[] = [];
  districtOptions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private merchService: MerchService,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.propertyData = navigation.extras.state['property'];
      console.log('接收到的旅館資料:', this.propertyData);
    }
  }

  ngOnInit(): void {
    this.initForm();
    if (this.propertyData) {
      this.populateForm();
    }
    this.loadLocations();
  }

  private initForm(): void {
    this.propertyForm = this.fb.group({
      name: ['', Validators.required],
      businessCode: ['', Validators.required],
      bankAccount: ['', Validators.required],
      tel: ['', Validators.required],
      city: ['', Validators.required],
      district: ['', Validators.required],
      addressDetail: ['', Validators.required],
      info: ['', Validators.required],
      checkNotice: ['', Validators.required],
      petNotice: ['', Validators.required],
      propertyNotice: ['']
    });
  }

  private populateForm(): void {
    this.propertyForm.patchValue({
      name: this.propertyData.name || '',
      businessCode: this.propertyData.businessCode || '',
      bankAccount: this.propertyData.bankAccount || '',
      tel: this.propertyData.tel || '',
      city: this.propertyData.city || '',
      district: this.propertyData.district || '',
      addressDetail: this.propertyData.addressDetail || '',
      info: this.propertyData.info || '',
      checkNotice: this.propertyData.checkNotice || '',
      petNotice: this.propertyData.petNotice || '',
      propertyNotice: this.propertyData.propertyNotice || ''
    });

    if (this.propertyForm.value.city) {
      this.onCityChange({ value: this.propertyForm.value.city });
    }
  }

  loadLocations() {
  //   this.merchService.getLocations({}).subscribe(res => {
  //     this.cities = res.data;
  //   });
  }

  onCityChange(event: any) {
    const selectedCity = event.value;
    const cityObj = this.cities.find(c => c.city === selectedCity);
    this.districtOptions = cityObj ? cityObj.districts : [];
    this.propertyForm.patchValue({ district: '' });
  }

  onSubmit(): void {
    if (this.propertyForm.invalid) {
      this.propertyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.propertyForm.value;
    this.merchService.createHotelDetail(formData).subscribe({
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
