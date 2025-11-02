import { MediaService } from './../../core/services/media.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MERCH007Tranrq, MERCH007TranrqPropertyImage } from '../../core/interfaces/MERCH007Req.interface';
import { MerchService } from '../../core/services/merch-service';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';
import { HotelService } from './../../core/services/hotel-service';
import { MultiSelectModule } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MessageService } from 'primeng/api';
import { MERCH025Tranrs } from '../../core/interfaces/MERCH025Res.interface';

@Component({
    selector: 'app-merchant-property-edit-page',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        SharedConfirmDialog,
        MultiSelectModule,
        Select,
        DragDropModule
    ],
    templateUrl: './merchant-property-edit-page.html',
    styleUrl: './merchant-property-edit-page.css'
})
export class MerchantPropertyEditPage {

    // 圖片相關屬性
    uploadedImages: UploadedImage[] = [];
    existingImages: ExistingImage[] = [];
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
     * @param router
     * @param hotelService
     * @param mediaService
     * @param messageService
     */
    constructor(
        private fb: FormBuilder,
        private merchService: MerchService,
        private router: Router,
        private hotelService: HotelService,
        private mediaService: MediaService,
        private messageService: MessageService
    ) {
        this.propertyForm = this.fb.group({
            name: [{ value: '', disabled: true }],
            businessCode: [{ value: '', disabled: true }],
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

        const navigation = this.router.getCurrentNavigation();

        if (navigation?.extras?.state) {
            this.propertyId = navigation.extras.state['property']?.id || '';
            this.hotelService.querySingleHotelDetailForMerchant(this.propertyId).subscribe({
                next: (response) => {
                    if (response.MWHEADER.RETURNCODE === '0000') {
                        this.propertyData = response.TRANRS.singleHotelDetail;
                        const propertyFacilities = this.propertyData.facilities;
                        this.propertyForm.patchValue({
                            name: this.propertyData.name || '',
                            businessCode: this.propertyData.businessCode || '',
                            bankAccount: this.propertyData.bankAccount || '',
                            tel: this.propertyData.tel || '',
                            city: this.propertyData.city || '',
                            district: this.propertyData.district || '',
                            addressDetail: this.extractDetailAddress(this.propertyData.address) || '',
                            selectedFacilities: propertyFacilities || '',
                            info: this.propertyData.info || '',
                            checkNotice: this.propertyData.checkNotice || '',
                            petNotice: this.propertyData.petNotice || '',
                            propertyNotice: this.propertyData.propertyNotice || '',
                        });
                    } else {
                        setTimeout(() => this.router.navigate(['/merchants/property/homepage']), 2000);
                    }
                },
                error: (error) => {
                    console.error('獲取資訊失敗:', error);
                    setTimeout(() => this.router.navigate(['/merchants/property/homepage']), 2000);
                }
            })
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
                    console.error('獲取資訊失敗:', error);
                    setTimeout(() => this.router.navigate(['/merchants/property/homepage']), 2000);
                }
            });

            this.merchService.queryAllFacilities().subscribe({
                next: (response) => {
                    this.avaliableFacilities = response;
                },
                error: (error) => {
                    console.error('獲取資訊失敗:', error);
                    setTimeout(() => this.router.navigate(['/merchants/property/homepage']), 2000);
                }
            });

            this.loadExistingImages();
        }
    }

    /**
     * 按下儲存按鈕後的業務邏輯
     * @returns
     */
    async onSubmit(): Promise<void> {

        if (this.propertyForm.invalid) {
            this.errorMessage = '請填寫所有必填欄位';
            this.propertyForm.markAllAsTouched();
            return;
        }

        if (!this.propertyId) {
            this.errorMessage = '無法取得旅館 ID';
            return;
        }

        this.errorMessage = '';

        const propertyImages: MERCH007TranrqPropertyImage[] = [];

        for (let img of this.existingImages) {
            propertyImages.push({
                mediaId: img.mediaId,
                sortOrder: img.sortOrder
            })
        }

        const tranrq: MERCH007Tranrq = {
            id: this.propertyId,
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

        this.merchService.editHotelDetail(tranrq).subscribe({
            next: (res) => {
                if (res.MWHEADER.RETURNCODE === '0000') {
                    this.router.navigate(['/merchants/property/info']);
                }
            },
            error: (err) => {
                console.error('API 錯誤:', err);
            }
        });

        try {
            // 1. 刪除已標記的圖片
            if (this.deletedImageIds.length > 0) {
                this.messageService.add({
                    severity: 'info',
                    summary: '處理中',
                    detail: `正在刪除 ${this.deletedImageIds.length} 張圖片...`
                });

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

            // 2. 上傳新圖片
            if (this.uploadedImages.length > 0) {
                this.messageService.add({
                    severity: 'info',
                    summary: '上傳中',
                    detail: `正在上傳 ${this.uploadedImages.length} 張圖片...`
                });

                await this.uploadAllImages();
            }

            // 3. 更新現有圖片的排序
            if (this.existingImages.length > 0) {
                const updatePromises = this.existingImages.map((img) =>
                    new Promise<void>((resolve, reject) => {
                        this.mediaService.updateMedia({
                            MWHEADER: { MSGID: 'MEDIA-002' },
                            TRANRQ: {
                                medias: [{
                                    mediaId: img.mediaId,
                                    sortOrder: img.sortOrder
                                }]
                            }
                        }).subscribe({
                            next: (res) => {
                                if (res.MWHEADER.RETURNCODE === '0000') {
                                    resolve();
                                } else {
                                    reject(new Error('更新圖片排序失敗'));
                                }
                            },
                            error: (err) => reject(err)
                        });
                    })
                );

                await Promise.all(updatePromises);
            }
        } catch (error: any) {
            this.errorMessage = error.message || '處理圖片失敗，請稍後再試';
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
        if (this.propertyForm.dirty) {
            this.cancelConfirmVisible = true;
        } else {
            this.onCancelConfirm();
        }
    }

    /**
     * 放棄修改
     */
    onCancelConfirm(): void {
        this.cancelConfirmVisible = false;
        this.router.navigate(['/merchants/property/info']);
    }

    /**
     * 按下取消按鈕後，又決定繼續編輯
     */
    onCancelCancel(): void {
        this.cancelConfirmVisible = false;
    }

    /**
     * 擷取完整地址的部分內容
     * @param address
     * @returns
     */
    extractDetailAddress(address: string): string | null {
        const match = address.match(/^(?:.+?[縣市])(?:.+?[鄉鎮市區])(.*)$/);
        return match ? match[1].trim() : null;
    }

    /**
     * 當住宿地址的縣市別更改，此函數會觸發，使得鄉鎮市區選單內的選項都是對應該縣市的行政區
     * @param city
     */
    onCityChange(city: string): void {
        this.propertyForm.controls['city'].setValue(city);
        this.avaliableDistrict = this.rawList
            .filter(o => o.city === city)
            .map(o => o.district);
        this.propertyForm.controls['district'].setValue(''); // 重設已選區
    }

    // 下列部分程式碼參考 room-info-edit-page.ts

    /**
     * 載入現有圖片
     */
    private loadExistingImages(): void {
        if (!this.propertyId) return;

        this.mediaService.onGetMediaApi({
            MWHEADER: { MSGID: 'MEDIA-004' },
            TRANRQ: { propertyId: this.propertyId }
        }).subscribe({
            next: (res) => {
                if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS.medias) {
                    this.existingImages = res.TRANRS.medias.map(media => ({
                        mediaId: media.mediaId,
                        base64Data: media.base64Data,
                        sortOrder: media.sortOrder || 0
                    }));
                    console.log('已載入現有圖片:', this.existingImages.length);
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
                                category: 'Property_Image',
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
}

interface UploadedImage {
    file: File;
    previewUrl: string;
    sortOrder: number;
}

interface ExistingImage {
    mediaId: string;
    base64Data: string;
    sortOrder: number;
}