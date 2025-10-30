import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MerchService } from '../../core/services/merch-service';
import { MediaService } from '../../core/services/media.service';
import { MERCH008Tranrq, PropertyImage } from '../../core/interfaces/MERCH008Req.interface';
import { MERCH015Tranrs } from '../../core/interfaces/MERCH015Res.interface';

interface UploadedImage {
  file: File;
  previewUrl: string;
  sortOrder: number;
}

interface CityDistrictOption {
  id: string;
  city: string;
  district: string;
  label: string;
}

interface FacilityOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-merchant-property-insert-page',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    MultiSelectModule,
    DragDropModule
  ],
  templateUrl: './merchant-property-insert-page.html',
  styleUrl: './merchant-property-insert-page.css',
})
export class MerchantPropertyInsertPage implements OnInit {
  private merchService = inject(MerchService);
  private mediaService = inject(MediaService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  // 表單資料
  sellerId: string = '';
  name: string = '';
  tel: string = '';
  businessCode: string = '';
  selectedCityDistrict: CityDistrictOption | null = null;
  addressDetail: string = '';
  bankAccount: string = '';
  info: string = '';
  checkNotice: string = '';
  petNotice: string = '';
  propertyNotice: string = '';
  selectedFacilities: FacilityOption[] = [];

  // 下拉選項
  cityDistrictOptions: CityDistrictOption[] = [];
  facilityOptions: FacilityOption[] = [
    { id: 'F001', name: '寵物游泳池' },
    { id: 'F002', name: '專屬遊戲區' },
    { id: 'F003', name: '24小時監視系統' },
    { id: 'F004', name: '寵物美容服務' },
    { id: 'F005', name: '免費停車場' },
    { id: 'F006', name: '空調設備' },
    { id: 'F007', name: '獨立衛浴' },
    { id: 'F008', name: 'WiFi' }
  ];

  // 圖片相關
  uploadedImages: UploadedImage[] = [];

  // 狀態
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    // 從 localStorage 獲取 sellerId
    this.sellerId = localStorage.getItem('sellerId') || '';

    // 載入縣市區域選項
    this.loadCityDistricts();
  }

  /**
   * 載入縣市區域選項
   */
  loadCityDistricts(): void {
    this.isLoading = true;
    this.merchService.getCityDistricts().subscribe({
      next: (res) => {
        if (res.MWHEADER.RETURNCODE === '0000') {
          this.cityDistrictOptions = res.TRANRS.map((item: MERCH015Tranrs) => ({
            id: item.id,
            city: item.city,
            district: item.district,
            label: `${item.city}${item.district}`
          }));
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('載入縣市區域失敗', err);
        this.messageService.add({
          severity: 'error',
          summary: '錯誤',
          detail: '載入縣市區域失敗'
        });
        this.isLoading = false;
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

    // 清空 input
    input.value = '';
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
   * 拖拉排序
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
   * 上傳所有圖片到伺服器
   */
  private async uploadAllImages(propertyId: string): Promise<PropertyImage[]> {
    const results: PropertyImage[] = [];

    for (let index = 0; index < this.uploadedImages.length; index++) {
      const uploadedImage = this.uploadedImages[index];

      try {
        const result = await new Promise<PropertyImage>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            const base64Data = (reader.result as string).split(',')[1];

            const postData = {
              MWHEADER: {
                MSGID: 'MEDIA-001'
              },
              TRANRQ: {
                category: 'PROPERTY',
                referenceId: propertyId,
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
                  const result: PropertyImage = {
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
   * 驗證表單
   */
  private validateForm(): boolean {
    if (!this.name || !this.tel || !this.businessCode ||
        !this.selectedCityDistrict || !this.addressDetail ||
        !this.bankAccount || !this.info || !this.checkNotice || !this.petNotice) {
      this.errorMessage = '請填寫所有必填欄位';
      return false;
    }
    return true;
  }

  /**
   * 儲存旅館
   */
  async saveHotel(): Promise<void> {
    this.errorMessage = '';

    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    try {
      // 建立旅館資料（先不含圖片）
      const tranrq: MERCH008Tranrq = {
        sellerId: this.sellerId,
        name: this.name,
        tel: this.tel,
        businessCode: this.businessCode,
        city: this.selectedCityDistrict!.city,
        district: this.selectedCityDistrict!.district,
        addressDetail: this.addressDetail,
        bankAccount: this.bankAccount,
        info: this.info,
        checkNotice: this.checkNotice,
        petNotice: this.petNotice,
        propertyNotice: this.propertyNotice || '',
        facilities: this.selectedFacilities.map(f => f.id),
        propertyImages: []
      };

      // 送出旅館資料
      this.merchService.createProperty(tranrq).subscribe({
        next: async (res) => {
          if (res.MWHEADER.RETURNCODE === '0000') {
            const newPropertyId = res.TRANRS.id;

            // 上傳圖片
            if (this.uploadedImages.length > 0) {
              this.messageService.add({
                severity: 'info',
                summary: '上傳中',
                detail: `正在上傳 ${this.uploadedImages.length} 張圖片...`
              });

              try {
                await this.uploadAllImages(newPropertyId);
                this.messageService.add({
                  severity: 'success',
                  summary: '成功',
                  detail: '旅館新增成功，所有圖片上傳完成'
                });
              } catch (error: any) {
                this.messageService.add({
                  severity: 'warn',
                  summary: '警告',
                  detail: '旅館新增成功，但部分圖片上傳失敗'
                });
              }
            } else {
              this.messageService.add({
                severity: 'success',
                summary: '成功',
                detail: '旅館新增成功'
              });
            }

            // 導航到旅館列表頁
            this.router.navigate(['/merchants/property/list']);
          } else {
            this.errorMessage = res.MWHEADER.RETURNDESC || '新增失敗';
            this.messageService.add({
              severity: 'error',
              summary: '錯誤',
              detail: this.errorMessage
            });
          }
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('新增旅館失敗', err);
          this.errorMessage = '網路或伺服器錯誤，請稍後再試';
          this.messageService.add({
            severity: 'error',
            summary: '錯誤',
            detail: this.errorMessage
          });
          this.isSubmitting = false;
        }
      });

    } catch (error: any) {
      this.errorMessage = error.message || '新增失敗，請稍後再試';
      this.messageService.add({
        severity: 'error',
        summary: '錯誤',
        detail: this.errorMessage
      });
      this.isSubmitting = false;
    }
  }

  /**
   * 重置表單
   */
  resetForm(): void {
    this.name = '';
    this.tel = '';
    this.businessCode = '';
    this.selectedCityDistrict = null;
    this.addressDetail = '';
    this.bankAccount = '';
    this.info = '';
    this.checkNotice = '';
    this.petNotice = '';
    this.propertyNotice = '';
    this.selectedFacilities = [];
    this.uploadedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    this.uploadedImages = [];
    this.errorMessage = '';
  }
}
