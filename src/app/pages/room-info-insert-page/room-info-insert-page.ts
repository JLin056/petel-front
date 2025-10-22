import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MerchService } from '../../core/services/merch-service';
import { Router } from '@angular/router';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';

@Component({
  selector: 'app-room-info-insert-page',
  imports: [CommonModule, ReactiveFormsModule, EditorModule, AutoCompleteModule, SharedConfirmDialog],
  templateUrl: './room-info-insert-page.html',
  styleUrl: './room-info-insert-page.css',
  encapsulation: ViewEncapsulation.None
})
export class RoomInfoInsertPage implements OnInit {
  // 所有屬性定義
  roomForm!: FormGroup;
  filteredPetTypes: PetTypeOption[] = [];
  petTypes: PetTypeOption[] = [
    { name: '貓', id: 'W001' },
    { name: '迷你犬', id: 'W002' },
    { name: '小型犬', id: 'W003' },
    { name: '中型犬', id: 'W004' },
    { name: '大型犬', id: 'W005' },
    { name: '超大型犬', id: 'W006' }
  ];
  cancelConfirmVisible: boolean = false;
  isSubmitting: boolean = false;  // 明確指定型別
  errorMessage: string = '';      // 明確指定型別
  propertyId: string = 'P000000001'; // 明確指定型別

  constructor(
    private fb: FormBuilder,
    private merchService: MerchService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.roomForm = this.fb.group({
      petTypeObject: [null, Validators.required],
      name: ['', Validators.required],
      size: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      unit: ['', [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+$/)]]
    });
  }

  filterPetTypes(event: any): void {
    const query = event.query.toLowerCase();
    this.filteredPetTypes = this.petTypes.filter(type =>
      type.name.toLowerCase().includes(query)
    );
  }

  onSubmit(): void {
    this.roomForm.markAllAsTouched();

    if (this.roomForm.invalid) {
      this.errorMessage = '請填寫所有必填欄位';
      console.log('表單驗證失敗:', this.roomForm.errors);
      console.log('表單值:', this.roomForm.value);
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    const formData = this.roomForm.value;

    const tranrq = {
      propertyId: this.propertyId,
      petTypeId: formData.petTypeObject?.id || '',
      name: formData.name,
      roomSize: formData.size,
      info: formData.description,
      basePrice: Number(formData.price),
      totalUnits: Number(formData.unit)
    };

    console.log('發送資料:', tranrq);

    this.merchService.createRoomDetail(tranrq).subscribe({
      next: (res) => {
        console.log('API 回應:', res);

        if (res.MWHEADER.RETURNCODE === '0000') {
          console.log('房型新增成功！');
          this.router.navigate(['/merchants/property/homepage']);
        } else {
          this.errorMessage = '新增失敗';
          console.warn('新增失敗:', this.errorMessage);
        }

        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('API 錯誤:', err);
        this.errorMessage = '網路或伺服器錯誤，請稍後再試';
        this.isSubmitting = false;
      }
    });
  }

  onCancelClick(): void {
    if (this.roomForm.dirty) {
      this.cancelConfirmVisible = true;
    } else {
      this.onCancelConfirm();
    }
  }

  onCancelConfirm(): void {
    this.cancelConfirmVisible = false;
    this.router.navigate(['/merchants/property/homepage']);
  }

  onCancelCancel(): void {
    this.cancelConfirmVisible = false;
  }

  getErrorMessage(controlName: string): string {
    const control = this.roomForm.get(controlName);
    
    if (control?.hasError('required')) {
      return '此欄位為必填';
    }
    if (control?.hasError('min')) {
      return '數值必須大於 0';
    }
    if (control?.hasError('pattern')) {
      return '請輸入有效的數字';
    }
    
    return '';
  }
}