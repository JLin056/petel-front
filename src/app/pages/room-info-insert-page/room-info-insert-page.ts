import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { EditorModule } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { MERCH004Tranrq } from '../../core/interfaces/MERCH004Req.interface';
import { MediaService } from '../../core/services/media.service';
import { MerchService } from '../../core/services/merch-service';
import { PropertyStateService } from '../../core/services/property-state.service';
import { SharedConfirmDialog } from "../shared-confirm-dialog/shared-confirm-dialog";

interface PetTypeOption {
  name: string;
  id: string;
}

interface UnitOption {
  label: string;
  value: number;
}

interface UploadedImage {
  file: File;
  previewUrl: string;
  sortOrder: number;
}

@Component({
  selector: 'app-room-info-insert-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EditorModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    DragDropModule,
    SharedConfirmDialog
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

  unitOptions: UnitOption[] = Array.from({ length: 20 }, (_, i) => ({
    label: `${i + 1} 間`,
    value: i + 1
  }));

  cancelConfirmVisible: boolean = false;
  isSubmitting: boolean = false;
  isSubmitted: boolean = false;
  errorMessage: string = '';
  propertyId: string = '';

  // 圖片相關
  uploadedImages: UploadedImage[] = [];

  constructor(
    private fb: FormBuilder,
    private merchService: MerchService,
    private mediaService: MediaService,
    private router: Router,
    private propertyStateService: PropertyStateService
  ) { }

  ngOnInit(): void {
    this.propertyId = this.propertyStateService.getCurrentPropertyId();

    if (!this.propertyId) {
      this.errorMessage = '無法取得旅館資訊';
      this.messageService.add({
        severity: 'warn',
        summary: '無法取得旅館資訊',
        detail: '請先選擇旅館'
      });
      setTimeout(() => {
        this.router.navigate(['/merchants/property/homepage']);
      }, 2000);
      return;
    }
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

  /** 自訂 HTML 必填驗證器 */
  htmlRequiredValidator(control: any) {
    const value = control.value || '';
    // 移除 HTML 標籤及空白
    const text = value.replace(/<[^>]*>/g, '').trim();
    return text.length > 0 ? null : { required: true };
  }

  /**
   * 處理圖片選擇
   */
  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);

    // 先過濾出有效的檔案
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: '錯誤',
          detail: `${file.name} 檔案過大，請選擇小於 5MB 的圖片`
        });
        return false;
      }
      return true;
    });

    const startIndex = this.uploadedImages.length;

    validFiles.forEach((file, index) => {
      // 建立預覽 URL
      const previewUrl = URL.createObjectURL(file);

      const uploadedImage: UploadedImage = {
        file,
        previewUrl,
        sortOrder: startIndex + index + 1
      };

      this.uploadedImages.push(uploadedImage);
    });
    input.value = '';
  }

  /**
   * 上傳所有圖片到伺服器（循序上傳，避免 mediaId 衝突）
   */
  private async uploadAllImages(): Promise<{ mediaId: string; sortOrder: number }[]> {
    const results: { mediaId: string; sortOrder: number }[] = [];

    for (let index = 0; index < this.uploadedImages.length; index++) {
      const uploadedImage = this.uploadedImages[index];

      try {
        const result = await new Promise<{ mediaId: string; sortOrder: number }>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            const base64Data = (reader.result as string).split(',')[1];

            const postData = {
              MWHEADER: {
                MSGID: 'MEDIA-001'
              },
              TRANRQ: {
                category: 'ROOM',
                referenceId: this.propertyId,
                medias: [{
                  base64Data: base64Data,
                  fileName: uploadedImage.file.name,
                  mimeType: uploadedImage.file.type,
                  bucket: 'petel-media',
                  sizeBytes: uploadedImage.file.size,
                  visibility: 'PUBLIC',
                  sortOrder: uploadedImage.sortOrder
                }]
              }
            };

            this.mediaService.uploadMedia(postData).subscribe({
              next: (res) => {
                if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS.results.length > 0) {
                  const result = {
                    mediaId: res.TRANRS.results[0].mediaId,
                    sortOrder: uploadedImage.sortOrder
                  };
                  resolve(result);
                } else {
                  reject(new Error(`${uploadedImage.file.name} 上傳失敗: ${res.MWHEADER.RETURNDESC}`));
                }
              },
              error: (err) => {
                reject(new Error(`${uploadedImage.file.name} 上傳錯誤: ${err.message}`));
              }
            });
          };

          reader.onerror = () => {
            reject(new Error(`${uploadedImage.file.name} 讀取失敗`));
          };

          reader.readAsDataURL(uploadedImage.file);
        });

        results.push(result);

      } catch (error) {
        throw error;
      }
    }

    return results;
  }

  /**
   * 移除圖片
   */
  removeImage(index: number): void {
    const image = this.uploadedImages[index];
    URL.revokeObjectURL(image.previewUrl);
    this.uploadedImages.splice(index, 1);
    this.updateSortOrder();
  }

  /**
   * 拖拉排序事件處理
   */
  onImageDrop(event: CdkDragDrop<UploadedImage[]>): void {
    moveItemInArray(this.uploadedImages, event.previousIndex, event.currentIndex);
    this.updateSortOrder();
  }

  /**
   * 更新圖片排序
   */
  private updateSortOrder(): void {
    this.uploadedImages.forEach((img, index) => {
      img.sortOrder = index + 1;
    });
  }

  /**
   * 提交表單
   * @returns 
   */
  async onSubmit(): Promise<void> {
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: '提醒',
        detail: '請確認所有欄位皆已填寫完成'
      });
      return;
    }

    if (this.uploadedImages.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: '錯誤',
        detail: '請至少上傳一張圖片'
      });
      return;
    }

    const formValue = this.roomForm.value;
    console.log('送出資料：', formValue);

    try {
      let roomImages: { mediaId: string; sortOrder: number }[] = [];

      if (this.uploadedImages.length > 0) {
        this.messageService.add({
          severity: 'info',
          summary: '上傳中',
          detail: `正在上傳 ${this.uploadedImages.length} 張圖片...`
        });

        roomImages = await this.uploadAllImages();

        this.messageService.add({
          severity: 'success',
          summary: '成功',
          detail: '所有圖片上傳完成'
        });
      }

      const formData = this.roomForm.value;
      const roomSizeText = `${formData.height}x${formData.length}x${formData.width}`;

      const tranrq: MERCH004Tranrq = {
        propertyId: this.propertyId,
        name: formData.name,
        totalUnits: Number(formData.unit),
        basePrice: Number(formData.price),
        petTypeId: formData.petTypeObject?.id || '',
        info: formData.description,
        roomSize: roomSizeText,
        roomImages: roomImages
      };

      this.merchService.createRoomDetail(tranrq).subscribe({
        next: (res) => {
          if (res.MWHEADER.RETURNCODE === '0000') {
            const newRoomId = res.TRANRS.id;
            if (!newRoomId) {
              this.messageService.add({ severity: 'error', summary: '錯誤', detail: '無法取得房型編號' });
              return;
            }
            this.messageService.add({
              severity: 'success',
              summary: '成功',
              detail: '房型新增成功'
            });

            this.router.navigate(
              ['/merchants/property/roomInfo'],
              { state: { roomId: newRoomId } }
            );
          } else {
            this.messageService.add({ severity: 'error', summary: '錯誤', detail: res.MWHEADER.RETURNDESC || '新增失敗' });
          }

          this.isSubmitting = false;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: '錯誤', detail: '系統發生錯誤，請稍後再試' });
          this.isSubmitting = false;
        }
      });
    } catch (error: any) {
      this.isSubmitting = false;
      this.messageService.add({
        severity: 'error',
        summary: '錯誤',
        detail: this.errorMessage
      });
    }
  }

  /**
   * 按下取消按鈕，彈出確認視窗
   */
  onCancelClick(): void {
    if (this.roomForm.dirty) {
      this.cancelConfirmVisible = true;
    } else {
      this.onCancelConfirm();
    }
  }

  /**
   * 放棄新增
   */
  onCancelConfirm(): void {
    this.cancelConfirmVisible = false;
    this.router.navigate(['/merchants/property/homepage']);
  }

  /**
   * 按下取消按鈕後，又決定繼續編輯
   */
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