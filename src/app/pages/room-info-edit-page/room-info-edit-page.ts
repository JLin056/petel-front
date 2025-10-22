import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EditorModule } from 'primeng/editor';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MerchService } from '../../core/services/merch-service';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';

@Component({
  selector: 'app-room-info-edit-page',
  imports: [CommonModule, ReactiveFormsModule, EditorModule, AutoCompleteModule, SharedConfirmDialog],
  templateUrl: './room-info-edit-page.html',
  styleUrl: './room-info-edit-page.css',
  encapsulation: ViewEncapsulation.None
})
export class RoomInfoEditPage implements OnInit {
  /** roomForm */
  roomForm!: FormGroup;
  /** filteredPetTypes */
  filteredPetTypes: PetTypeOption[] = [];
  /** petTypes */
  petTypes: PetTypeOption[] = [
    { name: '貓', id: 'W001' },
    { name: '迷你犬', id: 'W002' },
    { name: '小型犬', id: 'W003' },
    { name: '中型犬', id: 'W004' },
    { name: '大型犬', id: 'W005' },
    { name: '超大型犬', id: 'W006' }
  ];
  /** cancelConfirmVisible */
  cancelConfirmVisible: boolean = false;
  /** isSubmitting */
  isSubmitting: boolean = false;
  /** errorMessage */
  errorMessage: string = '';
  /** roomData - 從首頁傳來的房型資料 */
  roomData: any = null;
  /** roomId */
  roomId: string = '';

  /**
   * 注入
   */
  constructor(
    private fb: FormBuilder,
    private merchService: MerchService,
    private router: Router
  ) {
    // 從 router state 取得房型資料
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.roomData = navigation.extras.state['room'];
      this.roomId = this.roomData?.id || '';
      console.log('接收到的房型資料:', this.roomData);
    }
  }

  /**
   * 初始化
   */
  ngOnInit(): void {
    this.initForm();
    
    // 如果沒有房型資料，導回首頁
    if (!this.roomData || !this.roomId) {
      console.warn('沒有房型資料，導回首頁');
      this.errorMessage = '無法取得房型資料';
      setTimeout(() => {
        this.router.navigate(['/merchants/property/homepage']);
      }, 2000);
      return;
    }
    
    // 填入表單資料
    this.populateForm();
  }

  /**
   * 初始化表單
   */
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

  /**
   * 填入表單資料
   */
  private populateForm(): void {
    if (!this.roomData) return;

    // 找到對應的寵物種類物件
    const petType = this.petTypes.find(pt => pt.id === this.roomData.petTypeId);

    // 填入表單
    this.roomForm.patchValue({
      petTypeObject: petType || null,
      name: this.roomData.name || '',
      size: this.roomData.roomSize || '',
      description: this.roomData.info || '',
      price: this.roomData.basePrice || '',
      unit: this.roomData.totalUnits || ''
    });

    console.log('表單已填入資料:', this.roomForm.value);
  }

  /**
   * 過濾寵物種類
   */
  filterPetTypes(event: any): void {
    const query = event.query.toLowerCase();
    this.filteredPetTypes = this.petTypes.filter(type =>
      type.name.toLowerCase().includes(query)
    );
  }

  /**
   * 提交表單 - 修改
   */
  onSubmit(): void {
    this.roomForm.markAllAsTouched();

    if (this.roomForm.invalid) {
      this.errorMessage = '請填寫所有必填欄位';
      console.log('表單驗證失敗:', this.roomForm.errors);
      console.log('表單值:', this.roomForm.value);
      return;
    }

    if (!this.roomId) {
      this.errorMessage = '無法取得房型 ID';
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    const formData = this.roomForm.value;

    // 構建發送給後端的資料
    const tranrq = {
      id: this.roomId,  // 必須傳房間 ID
      propertyId: this.roomData.propertyId,  // 從原資料取得
      petTypeId: formData.petTypeObject?.id || '',
      name: formData.name,
      roomSize: formData.size,
      info: formData.description,
      basePrice: Number(formData.price),
      totalUnits: Number(formData.unit)
    };

    console.log('發送修改資料:', tranrq);

    this.merchService.editRoomDetail(tranrq).subscribe({
      next: (res) => {
        console.log('API 回應:', res);

        if (res.MWHEADER.RETURNCODE === '0000') {
          console.log('房型修改成功！');
          // 導航回房型列表頁
          this.router.navigate(['/merchants/property/homepage']);
        } else {
          this.errorMessage = '修改失敗';
          console.warn('修改失敗:', this.errorMessage);
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

  /**
   * 點擊取消按鈕
   */
  onCancelClick(): void {
    if (this.roomForm.dirty) {
      this.cancelConfirmVisible = true;
    } else {
      this.onCancelConfirm();
    }
  }

  /**
   * 確認取消
   */
  onCancelConfirm(): void {
    this.cancelConfirmVisible = false;
    this.router.navigate(['/merchants/property/homepage']);
  }

  /**
   * 取消取消動作
   */
  onCancelCancel(): void {
    this.cancelConfirmVisible = false;
  }

  /**
   * 取得欄位錯誤訊息
   */
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