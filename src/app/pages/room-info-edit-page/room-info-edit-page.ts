import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EditorModule } from 'primeng/editor';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { MerchService } from '../../core/services/merch-service';
import { MediaService } from '../../core/services/media.service';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-room-info-edit-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EditorModule,
    SelectModule,
    InputTextModule,
    MessageModule,
    SharedConfirmDialog,
    DragDropModule
  ],
  templateUrl: './room-info-edit-page.html',
  styleUrl: './room-info-edit-page.css',
  encapsulation: ViewEncapsulation.None
})
export class RoomInfoEditPage implements OnInit {
  /** roomForm */
  roomForm!: FormGroup;

  /** MessageService */
  messageService = inject(MessageService);

  /** cancelConfirmVisible */
  cancelConfirmVisible: boolean = false;

  /** isSubmitting */
  isSubmitting: boolean = false;

  /** isSubmitted - 新增 */
  isSubmitted: boolean = false;

  /** errorMessage */
  errorMessage: string = '';

  /** roomData */
  roomData: any = null;

  /** roomId */
  roomId: string = '';

  /** petTypes */
  petTypes: PetTypeOption[] = [
    { name: '貓', id: 'W001' },
    { name: '迷你犬', id: 'W002' },
    { name: '小型犬', id: 'W003' },
    { name: '中型犬', id: 'W004' },
    { name: '大型犬', id: 'W005' },
    { name: '超大型犬', id: 'W006' }
  ];

  /** unitOptions */
  unitOptions: UnitOption[] = Array.from({ length: 20 }, (_, i) => ({
    label: `${i + 1} 間`,
    value: i + 1
  }));

  // 圖片相關
  uploadedImages: UploadedImage[] = [];
  existingImages: ExistingImage[] = [];
  deletedImageIds: string[] = [];
  originalImageOrder: Map<string, number> = new Map();
  originalImageData: Map<string, any> = new Map();

  /**
   * 注入
   */
  constructor(
    private fb: FormBuilder,
    private merchService: MerchService,
    private mediaService: MediaService,
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
      this.errorMessage = '無法取得房型資料';
      this.router.navigate(['/merchants/property/homepage']);
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
      description: [''],
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

    // 解析尺寸字串 (例如: "100x200x300")
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
    this.loadExistingImages();
  }

  /**
   * 載入現有圖片
   */
  private loadExistingImages(): void {
    if (!this.roomId) return;

    this.mediaService.onGetMediaApi({
      MWHEADER: { MSGID: 'MEDIA-004' },
      TRANRQ: { roomId: this.roomId }
    }).subscribe({
      next: (res) => {
        if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS.medias) {
          this.existingImages = res.TRANRS.medias.map(media => ({
            mediaId: media.mediaId,
            base64Data: media.base64Data,
            sortOrder: media.sortOrder || 0
          }));
          res.TRANRS.medias.forEach(media => {
            this.originalImageOrder.set(media.mediaId, media.sortOrder || 0);
            this.originalImageData.set(media.mediaId, media);
          });
          console.log('已載入現有圖片:', this.existingImages.length);
          console.log('原始圖片資料:', res.TRANRS.medias);
        }
      },
      error: (err) => {
        console.error('載入現有圖片失敗', err);
      }
    });
  }

  /**
   * 處理圖片選擇
   */
  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);

    // 過濾有效檔案
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

    const startIndex = this.existingImages.length + this.uploadedImages.length;

    validFiles.forEach((file, index) => {
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
   * 移除新上傳的圖片
   */
  removeUploadedImage(index: number): void {
    const image = this.uploadedImages[index];
    URL.revokeObjectURL(image.previewUrl);
    this.uploadedImages.splice(index, 1);
    this.updateSortOrder();
  }

  /**
   * 移除現有圖片（加入刪除清單）
   */
  removeExistingImage(index: number): void {
    const image = this.existingImages[index];
    this.deletedImageIds.push(image.mediaId);
    this.existingImages.splice(index, 1);
    this.updateSortOrder();
  }

  /**
   * 拖拉排序事件處理
   */
  onImageDrop(event: CdkDragDrop<any[]>): void {
    // 合併兩個陣列進行排序
    const allImages = [...this.existingImages, ...this.uploadedImages];
    moveItemInArray(allImages, event.previousIndex, event.currentIndex);

    // 更新整體排序
    allImages.forEach((img, index) => {
      img.sortOrder = index + 1;
    });

    // 分離回原陣列
    this.existingImages = allImages.filter(img => 'mediaId' in img) as ExistingImage[];
    this.uploadedImages = allImages.filter(img => 'file' in img) as UploadedImage[];

    this.updateSortOrder();
  }

  /**
   * 更新圖片排序
   */
  private updateSortOrder(): void {
    this.existingImages.forEach((img, index) => {
      img.sortOrder = index + 1;
    });
    this.uploadedImages.forEach((img, index) => {
      img.sortOrder = this.existingImages.length + index + 1;
    });
  }

  /**
   * 上傳所有新圖片
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
              MWHEADER: { MSGID: 'MEDIA-001' },
              TRANRQ: {
                category: 'Room_Image',
                referenceId: this.roomId,
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
                  resolve({
                    mediaId: res.TRANRS.results[0].mediaId,
                    sortOrder: uploadedImage.sortOrder
                  });
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
   * 提交表單 - 修改
   */
  async onSubmit(): Promise<void> {
    this.isSubmitted = true;
    this.roomForm.markAllAsTouched();

    if (this.roomForm.invalid) {
      this.errorMessage = '請填寫所有必填欄位';
      return;
    }

    if (this.existingImages.length + this.uploadedImages.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: '錯誤',
        detail: '請至少上傳一張圖片'
      });
      return;
    }

    if (!this.roomId) {
      this.errorMessage = '無法取得房型 ID';
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    try {
      // 刪除已標記的圖片
      if (this.deletedImageIds.length > 0) {
        await new Promise<void>((resolve, reject) => {
          this.mediaService.deleteMedia({
            MWHEADER: { MSGID: 'MEDIA-003' },
            TRANRQ: { mediaIds: this.deletedImageIds }
          }).subscribe({
            next: (res) => {
              if (res.MWHEADER.RETURNCODE === '0000') {
                resolve();
              } else {
                reject(new Error('刪除圖片失敗'));
              }
            },
            error: (err) => reject(err)
          });
        });
      }

      // 上傳新圖片
      if (this.uploadedImages.length > 0) {
        await this.uploadAllImages();
      }

      // 更新現有圖片的排序（只更新有變更的）
      const imagesToUpdate = this.existingImages.filter(img =>
        this.originalImageOrder.get(img.mediaId) !== img.sortOrder
      );

      // 使用刪除後重傳的方式更新排序
      const USE_DELETE_AND_REUPLOAD = false;

      if (imagesToUpdate.length > 0 && !USE_DELETE_AND_REUPLOAD) {
        console.log(`有 ${imagesToUpdate.length} 張圖片的排序需要更新`);
        console.log('需要更新的圖片:', imagesToUpdate.map(img => ({
          mediaId: img.mediaId,
          oldOrder: this.originalImageOrder.get(img.mediaId),
          newOrder: img.sortOrder
        })));

        const updatePayload = {
          MWHEADER: { MSGID: 'MEDIA-002' },
          TRANRQ: {
            medias: imagesToUpdate.map(img => {
              const originalData = this.originalImageData.get(img.mediaId);
              return {
                mediaId: img.mediaId,
                sortOrder: img.sortOrder,
                fileName: originalData?.fileName,
                mimeType: originalData?.mimeType,
                bucket: originalData?.bucket,
                sizeBytes: originalData?.sizeBytes
              };
            })
          }
        };

        console.log('MEDIA-002 請求內容:', JSON.stringify(updatePayload, null, 2));

        // 批次更新所有需要變更的圖片
        await new Promise<void>((resolve, reject) => {
          this.mediaService.updateMedia(updatePayload).subscribe({
            next: (res) => {
              console.log('MEDIA-002 回應:', res);
              if (res.MWHEADER.RETURNCODE === '0000') {
                console.log('圖片排序更新成功');
                resolve();
              } else {
                console.error('更新圖片排序失敗:', res.MWHEADER);
                reject(new Error('更新圖片排序失敗: ' + res.MWHEADER.RETURNDESC));
              }
            },
            error: (err) => {
              console.error('更新圖片排序 API 錯誤:', err);
              console.error('HTTP 狀態碼:', err.status);
              console.error('錯誤訊息:', err.message);
              console.error('後端回應:', err.error);
              console.error('完整錯誤物件:', JSON.stringify(err, null, 2));
              reject(err);
            }
          });
        });
      } else if (imagesToUpdate.length > 0 && USE_DELETE_AND_REUPLOAD) {
        // 刪除所有圖片後重新上傳
        console.log('⚠️ 刪除後重新上傳來更新排序');

        const allMediaIds = this.existingImages.map(img => img.mediaId);

        // 刪除所有現有圖片
        await new Promise<void>((resolve, reject) => {
          this.mediaService.deleteMedia({
            MWHEADER: { MSGID: 'MEDIA-003' },
            TRANRQ: { mediaIds: allMediaIds }
          }).subscribe({
            next: (res) => {
              if (res.MWHEADER.RETURNCODE === '0000') {
                console.log('已刪除所有圖片');
                resolve();
              } else {
                reject(new Error('刪除圖片失敗'));
              }
            },
            error: (err) => reject(err)
          });
        });

        // 依新順序重新上傳所有圖片
        for (let index = 0; index < this.existingImages.length; index++) {
          const img = this.existingImages[index];
          const originalData = this.originalImageData.get(img.mediaId);

          await new Promise<void>((resolve, reject) => {
            this.mediaService.uploadMedia({
              MWHEADER: { MSGID: 'MEDIA-001' },
              TRANRQ: {
                category: 'Room_Image',
                referenceId: this.roomId,
                medias: [{
                  base64Data: img.base64Data,
                  fileName: originalData?.fileName || 'image.jpg',
                  mimeType: originalData?.mimeType || 'image/jpeg',
                  bucket: originalData?.bucket || 'petel-media',
                  sizeBytes: originalData?.sizeBytes || 0,
                  visibility: 'PUBLIC',
                  sortOrder: img.sortOrder
                }]
              }
            }).subscribe({
              next: (res) => {
                if (res.MWHEADER.RETURNCODE === '0000') {
                  resolve();
                } else {
                  reject(new Error('重新上傳圖片失敗'));
                }
              },
              error: (err) => reject(err)
            });
          });
        }

        console.log('✅ 所有圖片已重新上傳並更新排序');
      } else {
        console.log('沒有圖片排序需要更新');
      }

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

      this.merchService.editRoomDetail(tranrq).subscribe({
        next: (res) => {
          if (res.MWHEADER.RETURNCODE === '0000') {
            this.messageService.add({
              severity: 'success',
              summary: '成功',
              detail: '房型修改成功'
            });
            this.router.navigate(['/merchants/property/roomInfo'], {
              state: { roomId: this.roomId }
            });

          } else {
            this.errorMessage = '修改失敗';
          }
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('API 錯誤:', err);
          this.errorMessage = '網路或伺服器錯誤，請稍後再試';
          this.isSubmitting = false;
        }
      });

    } catch (error: any) {
      this.errorMessage = error.message || '處理圖片失敗，請稍後再試';
      this.messageService.add({
        severity: 'error',
        summary: '錯誤',
        detail: this.errorMessage
      });
      this.isSubmitting = false;
    }
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