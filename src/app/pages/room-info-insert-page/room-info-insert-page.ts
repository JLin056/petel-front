import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select'; // 👈 改成 SelectModule
import { MessageModule } from 'primeng/message';
import { MerchService } from '../../core/services/merch-service';
import { Router } from '@angular/router';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';
import { MessageService } from 'primeng/api';

interface PetTypeOption {
  name: string;
  id: string;
}

interface UnitOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-room-info-insert-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EditorModule,
    SharedConfirmDialog,
    InputTextModule,
    MessageModule,
    SelectModule
  ],
  templateUrl: './room-info-insert-page.html',
  styleUrl: './room-info-insert-page.css',
  encapsulation: ViewEncapsulation.None
})
export class RoomInfoInsertPage implements OnInit {
  roomForm!: FormGroup;
  messageService = inject(MessageService);

  petTypes: PetTypeOption[] = [
    { name: '貓', id: 'W001' },
    { name: '迷你犬', id: 'W002' },
    { name: '小型犬', id: 'W003' },
    { name: '中型犬', id: 'W004' },
    { name: '大型犬', id: 'W005' },
    { name: '超大型犬', id: 'W006' }
  ];

  // 房間數選項 1-20
  unitOptions: UnitOption[] = Array.from({ length: 20 }, (_, i) => ({
    label: `${i + 1} 間`,
    value: i + 1
  }));

  cancelConfirmVisible: boolean = false;
  isSubmitting: boolean = false;
  isSubmitted: boolean = false;
  errorMessage: string = '';
  propertyId: string = 'P000000001';

  constructor(
    private fb: FormBuilder,
    private merchService: MerchService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

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

  onSubmit(): void {
    this.isSubmitted = true;
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
    const roomSizeText = `${formData.height}x${formData.length}x${formData.width}`;

    const tranrq = {
      propertyId: this.propertyId,
      petTypeId: formData.petTypeObject?.id || '',
      name: formData.name,
      roomSize: roomSizeText,
      info: formData.description,
      basePrice: Number(formData.price),
      totalUnits: Number(formData.unit)
    };

    console.log('發送資料:', tranrq);

    this.merchService.createRoomDetail(tranrq).subscribe({
      next: (res: any) => { // 這裡將 res 類型設為 any 以方便處理
        console.log('API 回應:', res);

        if (res.MWHEADER.RETURNCODE === '0000') {
          console.log('房型新增成功！');
          const newRoomId = res.DATA?.roomId || res.DATA?.id;

          if (newRoomId) {
            console.log('導航到新增房型的詳細頁面，房型 ID:', newRoomId);
            // 🚨 步驟 2: 導航到詳細資訊頁面，並傳遞 ID
            this.router.navigate(['/merchants/property/roomInfo'], {
              state: {
                roomId: newRoomId,
              }
            });
            this.messageService.add({ severity: 'success', summary: '成功', detail: '房型新增成功，正在導航至詳細頁...' });
          } else {
            // 如果成功但沒有 ID，導航回列表頁並提示
            console.warn('新增成功，但無法取得新的房型 ID，導航回列表頁。');
            this.messageService.add({ severity: 'warn', summary: '成功', detail: '房型新增成功，但無法導航至詳細頁。' });
            this.router.navigate(['/merchants/property/homepage']);
          }

        } else {
          this.errorMessage = res.MWHEADER.RETURNMSG || '新增失敗';
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