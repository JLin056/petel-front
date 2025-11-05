import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MerchService } from '../../core/services/merch-service';
import { MediaService } from '../../core/services/media.service';
import { MERCH025Tranrs } from '../../core/interfaces/MERCH025Res.interface';
import { MERCH008Tranrq, MERCH008TranrqPropertyImage } from '../../core/interfaces/MERCH008Req.interface';
import { SharedConfirmDialog } from "../shared-confirm-dialog/shared-confirm-dialog";
import { MERCH011Tranrs } from '../../core/interfaces/MERCH011Res.interface';
import { firstValueFrom } from 'rxjs';
import { Res } from '../../core/interfaces/Res.interface';
import { Toast } from "primeng/toast";

@Component({
  selector: 'app-property-insert',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MultiSelectModule,
    Select,
    DragDropModule,
    SharedConfirmDialog,
    Toast
  ],
  templateUrl: './merchant-property-insert-page.html',
  styleUrls: ['./merchant-property-insert-page.css'],
  providers: [MessageService]
})
export class MerchantPropertyInsertPage {

  // 圖片相關屬性
  uploadedImages: UploadedImage[] = [];
  deletedImageIds: string[] = [];

  // 表單群組
  propertyForm: FormGroup;
  // 取消確認彈窗
  cancelConfirmVisible = false;
  // 錯誤訊息
  errorMessage = '';
  // 旅館資料
  propertyData: any = null;
  // 旅館編號
  propertyId = '';

  // 地址相關屬性
  avaliableCities: string[] = [];
  avaliableDistrict: string[] = [];
  rawList: any[] = [];

  // 屬性：與 PETEL_FACILITIES 一致
  avaliableFacilities: MERCH025Tranrs[] = [];

  /**
   * 建構子注入
   * @param fb
   * @param merchService
   * @param mediaService
   * @param router
   * @param messageService
   */
  constructor(
    private fb: FormBuilder,
    private merchService: MerchService,
    private mediaService: MediaService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.propertyForm = this.fb.group({
      name: ['', Validators.required],
      businessCode: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Z][0-9]{7}$/)
        ]
      ],
      bankAccount: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{14,17}$/),
        ],
      ],
      tel: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9+\-()\s]{6,20}$/),
        ],
      ],
      city: ['', Validators.required],
      district: ['', Validators.required],
      addressDetail: ['', Validators.required],
      selectedFacilities: [[]],
      info: ['', Validators.required],
      checkNotice: ['', Validators.required],
      petNotice: ['', Validators.required],
      propertyNotice: [''],
    });

    this.loadFacilities();
    this.loadPostalData();
  }

  /**
   * 載入郵遞區號資料
   */
  private loadPostalData(): void {
    this.merchService.queryPostal().subscribe({
      next: (response) => {
        this.rawList = response;
        this.avaliableCities = [...new Set(response.map(o => o.city))];
      },
      error: (err) => console.error('載入地址失敗', err)
    });
  }

  /**
   * 載入設施
   */
  private loadFacilities(): void {
    this.merchService.queryAllFacilities().subscribe({
      next: (response) => this.avaliableFacilities = response,
      error: (err) => console.error('載入設施失敗', err)
    });
  }

  /**
   * 縣市變動更新區域
   */
  onCityChange(city: string): void {
    this.propertyForm.controls['city'].setValue(city);
    this.avaliableDistrict = this.rawList
      .filter(o => o.city === city)
      .map(o => o.district);
    this.propertyForm.controls['district'].setValue('');
  }

  /**
   * 圖片選擇
   */
  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({ severity: 'error', summary: '錯誤', detail: `${file.name} 檔案過大，請選擇小於 5MB 的圖片` });
        return false;
      }
      return true;
    });

    const startIndex = this.uploadedImages.length;
    validFiles.forEach((file, index) => {
      const previewUrl = URL.createObjectURL(file);
      this.uploadedImages.push({ file, previewUrl, sortOrder: startIndex + index + 1 });
    });

    input.value = '';
  }

  /**
   * 拖拉排序
   */
  onImageDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.uploadedImages, event.previousIndex, event.currentIndex);
    this.updateSortOrder();
  }

  /**
   * 更新排序
  */
  private updateSortOrder(): void {
    this.uploadedImages.forEach((img, index) => img.sortOrder = index + 1);
  }

  /**
   * 移除圖片
  */
  removeUploadedImage(index: number): void {
    const image = this.uploadedImages[index];
    URL.revokeObjectURL(image.previewUrl);
    this.uploadedImages.splice(index, 1);
    this.updateSortOrder();
  }

  /**
   * 上傳所有圖片
   */
  private async uploadAllImages(): Promise<{ mediaId: string; sortOrder: number }[]> {
    const results: { mediaId: string; sortOrder: number }[] = [];

    if (!this.uploadedImages || this.uploadedImages.length === 0) {
      throw new Error('請至少上傳一張圖片');
    }

    for (let index = 0; index < this.uploadedImages.length; index++) {
      const uploadedImage = this.uploadedImages[index];

      // 每次都使用新的 FileReader，避免舊狀態
      const result = await new Promise<{ mediaId: string; sortOrder: number }>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          try {
            const base64Data = (reader.result as string).split(',')[1];
            if (!base64Data || base64Data.trim() === '') {
              throw new Error('圖片讀取失敗');
            }

            const postData = {
              MWHEADER: { MSGID: 'MEDIA-001' },
              TRANRQ: {
                category: 'Property_Image',
                referenceId: '',
                medias: [{
                  base64Data,
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
                  resolve({ mediaId: res.TRANRS.results[0].mediaId, sortOrder: uploadedImage.sortOrder });
                } else {
                  reject(new Error(`${uploadedImage.file.name} 上傳失敗`));
                }
              },
              error: (err) => reject(err)
            });
          } catch (e) {
            reject(e);
          }
        };

        reader.onerror = () => reject(new Error(`${uploadedImage.file.name} 讀取失敗`));
        reader.readAsDataURL(uploadedImage.file);
      }).catch(err => {
        this.messageService.add({
          severity: 'error',
          summary: '圖片上傳失敗',
          detail: `${uploadedImage.file.name} 發生錯誤，請重新選擇`
        });
        this.uploadedImages = [];
        throw err;
      });
      results.push(result);
    }
    return results;
  }


  /**
   * 取得 sellerId
   */
  private async getSellerId(): Promise<string> {
    const accountId = localStorage.getItem('accountId') || '';
    try {
      const res: Res<MERCH011Tranrs> = await firstValueFrom(this.merchService.getSellerInfo(accountId));
      if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS) {
        return res.TRANRS.id;
      } else {
        throw new Error('取得商家會員資訊失敗');
      }
    } catch (error) {
      console.error('取得商家會員資訊錯誤', error);
      throw error;
    }
  }

  /**
   * 送出表單
   */
  async onSubmit(): Promise<void> {
    if (this.propertyForm.invalid) {
      this.errorMessage = '請填寫所有必填欄位';
      this.propertyForm.markAllAsTouched();
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

    const formValue = this.propertyForm.value;

    try {
      const sellerId = await this.getSellerId();

      let propertyImages: MERCH008TranrqPropertyImage[] = [];
      if (this.uploadedImages.length > 0) {
        const uploadedResults = await this.uploadAllImages();
        propertyImages = uploadedResults.map(r => ({ mediaId: r.mediaId, sortOrder: r.sortOrder }));
      }

      const tranrq: MERCH008Tranrq = {
        sellerId,
        name: this.propertyForm.controls['name'].value,
        businessCode: this.propertyForm.controls['businessCode'].value,
        bankAccount: this.propertyForm.controls['bankAccount'].value,
        tel: this.propertyForm.controls['tel'].value,
        city: this.propertyForm.controls['city'].value,
        district: this.propertyForm.controls['district'].value,
        addressDetail: this.propertyForm.controls['addressDetail'].value,
        info: this.propertyForm.controls['info'].value,
        checkNotice: this.propertyForm.controls['checkNotice'].value,
        petNotice: this.propertyForm.controls['petNotice'].value,
        propertyNotice: this.propertyForm.controls['propertyNotice'].value,
        facilities: this.propertyForm.controls['selectedFacilities'].value.map((f: any) => f.facilityId),
        propertyImages
      };

      this.merchService.createHotelDetail(tranrq).subscribe({
        next: (res) => {
          if (res.MWHEADER.RETURNCODE === '0000') {
            const newPropertyId = res.TRANRS.id;
            if (!newPropertyId) {
              this.messageService.add({ severity: 'error', summary: '錯誤', detail: '無法取得旅館編號' });
              return;
            }
            this.messageService.add({ severity: 'success', summary: '成功', detail: '旅館新增成功！' });
            this.router.navigate(
              ['/merchants/property/info'],
              { state: { propertyId: newPropertyId } }
            );
          } else {
            this.messageService.add({ severity: 'error', summary: '錯誤', detail: res.MWHEADER.RETURNDESC || '新增失敗' });
          }
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: '錯誤', detail: '系統發生錯誤，請稍後再試' });
        }
      });

    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: '錯誤', detail: error.message || '處理圖片失敗' });
    }
  }

  /**
   * 按下取消按鈕，彈出確認視窗
   */
  onCancelClick(): void {
    if (this.propertyForm.dirty) {
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
    this.router.navigate(['/merchants/userPage']);
  }

  /**
   * 按下取消按鈕後，又決定繼續編輯
   */
  onCancelCancel(): void {
    this.cancelConfirmVisible = false;
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        this.fillDemoData();
    }
  }

  /**
   * 帶入 demo 資料
   */
  fillDemoData(): void {
    const demoCity = this.avaliableCities[0] ?? '臺北市';
    this.onCityChange(demoCity);
    const demoDistrict = this.avaliableDistrict[0] ?? '';

    const demoFacilities = this.avaliableFacilities.slice(1, 4);

    this.propertyForm.patchValue({
        name: '毛孩樂園寵物旅館',
        businessCode: 'A1234567',
        bankAccount: '12345678901234',
        tel: '02-1234-5678',
        city: demoCity,
        district: demoDistrict,
        addressDetail: '信義路一段21號',
        selectedFacilities: demoFacilities,
        info: '近捷運、全天候空調與獨立通風，鄰近公園每日兩次散步。',
        checkNotice: '入住須出示疫苗證明，攜帶慣用飼料與牽繩。',
        petNotice: '若有分離焦慮請事先告知，初次入住可安排適應時段。',
        propertyNotice: '春節連假須預付訂金，臨時取消依規定酌收手續費。'
    });
  }
}

interface UploadedImage {
  file: File;
  previewUrl: string;
  sortOrder: number;
}
