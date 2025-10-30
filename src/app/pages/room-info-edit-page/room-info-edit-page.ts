import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EditorModule } from 'primeng/editor';
import { SelectModule } from 'primeng/select'; 
import { InputTextModule } from 'primeng/inputtext'; 
import { MessageModule } from 'primeng/message'; 
import { MerchService } from '../../core/services/merch-service';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';

interface PetTypeOption {
  name: string;
  id: string;
}

interface UnitOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-room-info-edit-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EditorModule,
    SelectModule,  
    InputTextModule,  
    MessageModule, 
    SharedConfirmDialog
  ],
  templateUrl: './room-info-edit-page.html',
  styleUrl: './room-info-edit-page.css',
  encapsulation: ViewEncapsulation.None
})
export class RoomInfoEditPage implements OnInit {
  /** roomForm */
  roomForm!: FormGroup;

  /** petTypes */
  petTypes: PetTypeOption[] = [
    { name: '貓', id: 'W001' },
    { name: '迷你犬', id: 'W002' },
    { name: '小型犬', id: 'W003' },
    { name: '中型犬', id: 'W004' },
    { name: '大型犬', id: 'W005' },
    { name: '超大型犬', id: 'W006' }
  ];

  unitOptions: UnitOption[] = Array.from({ length: 20 }, (_, i) => ({
    label: `${i + 1} 間`,
    value: i + 1
  }));

  /** cancelConfirmVisible */
  cancelConfirmVisible: boolean = false;

  /** isSubmitting */
  isSubmitting: boolean = false;

  /** isSubmitted */
  isSubmitted: boolean = false;

  /** errorMessage */
  errorMessage: string = '';

  /** roomData */
  roomData: any = null;

  /** roomId */
  roomId: string = '';

  constructor(
    private fb: FormBuilder,
    private merchService: MerchService,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.roomData = navigation.extras.state['room'];
      this.roomId = this.roomData?.id || '';
      console.log('接收到的房型資料:', this.roomData);
    }
  }

  ngOnInit(): void {
    this.initForm();

    if (!this.roomData || !this.roomId) {
      console.warn('沒有房型資料，導回首頁');
      setTimeout(() => {
        this.router.navigate(['/merchants/property/homepage']);
      }, 2000);
      return;
    }
    this.populateForm();
  }

  /**
   * 初始化表單
   */
  private initForm(): void {
    this.roomForm = this.fb.group({
      petTypeObject: [null, Validators.required],
      name: ['', Validators.required],
      height: ['', [Validators.required, Validators.min(1)]], 
      length: ['', [Validators.required, Validators.min(1)]],  
      width: ['', [Validators.required, Validators.min(1)]],   
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      unit: [null, Validators.required]  
    });
  }

  /**
   * 填入表單資料
   */
  private populateForm(): void {
    if (!this.roomData) return;
    const petType = this.petTypes.find(pt => pt.id === this.roomData.petTypeId);
    const sizes = this.roomData.roomSize?.split('x') || ['', '', ''];

    this.roomForm.patchValue({
      petTypeObject: petType || null,
      name: this.roomData.name || '',
      height: sizes[0] || '',  
      length: sizes[1] || '',   
      width: sizes[2] || '',    
      description: this.roomData.info || '',
      price: this.roomData.basePrice || '',
      unit: this.roomData.totalUnits || null  
    });
    console.log('表單已填入資料:', this.roomForm.value);
  }

  /**
   * 提交
   */
  onSubmit(): void {
    this.isSubmitted = true;  
    this.roomForm.markAllAsTouched();

    if (this.roomForm.invalid) {
      console.log('表單驗證失敗:', this.roomForm.errors);
      console.log('表單值:', this.roomForm.value);
      return;
    }
    if (!this.roomId) {
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    const formData = this.roomForm.value;
    const roomSizeText = `${formData.height}x${formData.length}x${formData.width}`;

    const tranrq = {
      id: this.roomId,  
      propertyId: this.roomData.propertyId,  
      petTypeId: formData.petTypeObject?.id || '',
      name: formData.name,
      roomSize: roomSizeText,  
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
          this.router.navigate(['/merchants/property/roomInfo']);
        } else {
          console.warn('修改失敗:', this.errorMessage);
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('API 錯誤:', err);
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