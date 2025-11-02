import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { MerchService } from '../../core/services/merch-service';
import { MediaService } from '../../core/services/media.service';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MERCH008TranrqPropertyImage } from '../../core/interfaces/MERCH008Req.interface';
import { MERCH025Tranrs } from '../../core/interfaces/MERCH025Res.interface';
import { MultiSelectModule } from 'primeng/multiselect';
import { Select } from 'primeng/select';

interface UploadedImage {
  file: File;
  previewUrl: string;
  sortOrder: number;
}

@Component({
  selector: 'app-merchant-property-insert-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    SharedConfirmDialog,
    DragDropModule,
    MultiSelectModule,
    Select
  ],
  templateUrl: './merchant-property-insert-page.html',
  styleUrl: './merchant-property-insert-page.css'
})
export class MerchantPropertyInsertPage implements OnInit {
  // 圖片相關
  uploadedImages: UploadedImage[] = [];

  // 表單
  propertyForm: FormGroup;

  // 取消確認彈窗
  cancelConfirmVisible = false;

  // 錯誤訊息
  errorMessage = '';

  // 地址相關
  avaliableCities: string[] = [];
  avaliableDistrict: string[] = [];
  rawList: any[] = [];

  // 設施
  avaliableFacilities: MERCH025Tranrs[] = [];

  /** MessageService */
  messageService = inject(MessageService);

  /**
   * 建構子
   */
  constructor(
    private fb: FormBuilder,
    private merchService: MerchService,
    private mediaService: MediaService,
    private router: Router
  ) {
    this.propertyForm = this.fb.group({
      name: ['', Validators.required],
      businessCode: ['', Validators.required],
      bankAccount: ['', Validators.required],
      tel: ['', Validators.required],
      city: ['', Validators.required],
      district: ['', Validators.required],
      addressDetail: ['', Validators.required],
      selectedFacilities: [[]],
      info: ['', Validators.required],
      checkNotice: ['', Validators.required],
      petNotice: ['', Validators.required],
      propertyNotice: ['']
    });
  }

  /**
   * 初始化
   */
  ngOnInit(): void {
    // 載入縣市區域
    this.merchService.queryPostal().subscribe({
      next: (response) => {
        this.rawList = response;
        this.avaliableCities = [
          ...new Set(response.map(o => o.city))
        ];
        this.avaliableDistrict = [
          ...new Set(response.map(o => o.district))
        ];
      },
      error: (error) => {
        console.error('載入縣市區域失敗:', error);
      }
    });

    // 載入設施
    this.merchService.queryAllFacilities().subscribe({
      next: (response) => {
        this.avaliableFacilities = response;
      },
      error: (error) => {
        console.error('載入設施失敗:', error);
      }
    });
  }

  /**
   * 當縣市改變時更新區域選項
   */
  onCityChange(city: string): void {
    this.propertyForm.controls['city'].setValue(city);
    this.avaliableDistrict = this.rawList
      .filter(o => o.city === city)
      .map(o => o.district);
    this.propertyForm.controls['district'].setValue('');
  }

  /**
   * 處理圖片選擇
   */
  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);

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
   * 移除上傳的圖片
   */
  removeUploadedImage(index: number): void {
    const image = this.uploadedImages[index];
    URL.revokeObjectURL(image.previewUrl);
    this.uploadedImages.splice(index, 1);
    this.updateSortOrder();
  }

  /**
   * 拖拉排序
   */
  onImageDrop(event: CdkDragDrop<UploadedImage[]>): void {
    moveItemInArray(this.uploadedImages, event.previousIndex, event.currentIndex);
    this.updateSortOrder();
  }

  /**
   * 更新排序
   */
  private updateSortOrder(): void {
    this.uploadedImages.forEach((img, index) => {
      img.sortOrder = index + 1;
    });
  }

  /**
   * 上傳所有圖片並返回 mediaId 陣列
   */
  private async uploadAllImages(): Promise<MERCH008TranrqPropertyImage[]> {
    if (this.uploadedImages.length === 0) return [];

    const uploadedMedias: MERCH008TranrqPropertyImage[] = [];

    for (let index = 0; index < this.uploadedImages.length; index++) {
      const uploadedImage = this.uploadedImages[index];

      try {
        const mediaId = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            const base64Data = (reader.result as string).split(',')[1];

            const postData = {
              MWHEADER: { MSGID: 'MEDIA-001' },
              TRANRQ: {
                category: 'Property_Image',
                referenceId: 'TEMP',
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
                  resolve(res.TRANRS.results[0].mediaId);
                } else {
                  reject(new Error(`${uploadedImage.file.name} 上傳失敗`));
                }
              },
              error: (err) => {
                reject(new Error(`${uploadedImage.file.name} 上傳錯誤`));
              }
            });
          };

          reader.onerror = () => {
            reject(new Error(`${uploadedImage.file.name} 讀取失敗`));
          };

          reader.readAsDataURL(uploadedImage.file);
        });

        uploadedMedias.push({
          mediaId: mediaId,
          sortOrder: uploadedImage.sortOrder
        });

      } catch (error) {
        throw error;
      }
    }

    return uploadedMedias;
  }

  /**
   * 提交表單
   */
  async onSubmit(): Promise<void> {
    if (this.propertyForm.invalid) {
      this.errorMessage = '請填寫所有必填欄位';
      this.propertyForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';

    try {
      // 1. 先上傳圖片
      let propertyImages: MERCH008TranrqPropertyImage[] = [];
      if (this.uploadedImages.length > 0) {
        this.messageService.add({
          severity: 'info',
          summary: '處理中',
          detail: `正在上傳 ${this.uploadedImages.length} 張圖片...`
        });

        propertyImages = await this.uploadAllImages();
      }

      // 2. 組合請求資料
      const tranrq = {
        sellerId: 'S000000001',
        name: this.propertyForm.controls['name'].value,
        businessCode: this.propertyForm.controls['businessCode'].value,
        tel: this.propertyForm.controls['tel'].value,
        city: this.propertyForm.controls['city'].value,
        district: this.propertyForm.controls['district'].value,
        addressDetail: this.propertyForm.controls['addressDetail'].value,
        bankAccount: this.propertyForm.controls['bankAccount'].value,
        info: this.propertyForm.controls['info'].value,
        checkNotice: this.propertyForm.controls['checkNotice'].value,
        petNotice: this.propertyForm.controls['petNotice'].value,
        propertyNotice: this.propertyForm.controls['propertyNotice'].value,
        facilities: this.propertyForm.controls['selectedFacilities'].value.map((facility: { facilityId: any; }) => facility.facilityId),
        propertyImages: propertyImages
      };

      // 3. 呼叫 MERCH-008
      this.merchService.createHotelDetail(tranrq).subscribe({
        next: (res) => {
          if (res.MWHEADER.RETURNCODE === '0000') {
            this.messageService.add({
              severity: 'success',
              summary: '成功',
              detail: '旅館新增成功'
            });
            setTimeout(() => {
              this.router.navigate(['/merchants/property/homepage']);
            }, 1500);
          } else {
            this.errorMessage = res.MWHEADER.RETURNDESC || '新增旅館失敗';
            this.messageService.add({
              severity: 'error',
              summary: '錯誤',
              detail: this.errorMessage
            });
          }
        },
        error: (err) => {
          console.error('MERCH-008 錯誤:', err);
          this.errorMessage = err.error?.message || '新增旅館失敗';
          this.messageService.add({
            severity: 'error',
            summary: '錯誤',
            detail: this.errorMessage
          });
        }
      });

    } catch (error: any) {
      this.errorMessage = error.message || '處理失敗';
      this.messageService.add({
        severity: 'error',
        summary: '錯誤',
        detail: this.errorMessage
      });
    }
  }

  /**
   * 點擊取消按鈕
   */
  onCancelClick(): void {
    if (this.propertyForm.dirty || this.uploadedImages.length > 0) {
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
   * 取消取消
   */
  onCancelCancel(): void {
    this.cancelConfirmVisible = false;
  }
}
