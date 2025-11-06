import { MediaService } from './../../core/services/media.service';
import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
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
import { Toast } from "primeng/toast";

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
        DragDropModule,
        Toast
    ],
    templateUrl: './merchant-property-edit-page.html',
    styleUrl: './merchant-property-edit-page.css'
    // encapsulation: ViewEncapsulation.None  // 註解掉，避免樣式干擾
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
            name: [{ value: '', disabled: true }, Validators.required],
            businessCode: [{ value: '', disabled: true }, [
                Validators.required,
                Validators.pattern(/^[A-Z][0-9]{7}$/)
            ]],
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

        const navigation = this.router.getCurrentNavigation();

        if (navigation?.extras?.state) {
            this.propertyId = navigation.extras.state['property']?.id || '';

            // 先載入所有可用的 facilities
            this.merchService.queryAllFacilities().subscribe({
                next: (response) => {
                    this.avaliableFacilities = response;

                    // 再載入旅館詳細資料
                    this.hotelService.querySingleHotelDetailForMerchant(this.propertyId).subscribe({
                        next: (response) => {
                            if (response.MWHEADER.RETURNCODE === '0000') {
                                this.propertyData = response.TRANRS.singleHotelDetail;
                                const propertyFacilities = this.propertyData.facilities;

                                // 從 avaliableFacilities 中找出對應的物件引用
                                const selectedFacilities = this.avaliableFacilities.filter((availFacility: MERCH025Tranrs) =>
                                    propertyFacilities.some((propFacility: { facilityId: string; facilityName: string }) =>
                                        propFacility.facilityId === availFacility.facilityId
                                    )
                                );

                                this.propertyForm.patchValue({
                                    name: this.propertyData.name || '',
                                    businessCode: this.propertyData.businessCode || '',
                                    bankAccount: this.propertyData.bankAccount || '',
                                    tel: this.propertyData.tel || '',
                                    city: this.propertyData.city || '',
                                    district: this.propertyData.district || '',
                                    addressDetail: this.extractDetailAddress(this.propertyData.address) || '',
                                    selectedFacilities: selectedFacilities,
                                    info: this.propertyData.info || '',
                                    checkNotice: this.propertyData.checkNotice || '',
                                    petNotice: this.propertyData.petNotice || '',
                                    propertyNotice: this.propertyData.propertyNotice || '',
                                });
                            } else {
                                this.router.navigate(['/merchants/property/homepage']);
                            }
                        },
                        error: (error) => {
                            this.router.navigate(['/merchants/property/homepage']);
                        }
                    });
                },
                error: () => {
                    this.router.navigate(['/merchants/property/homepage']);
                }
            });
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
                error: () => {
                    this.router.navigate(['/merchants/property/homepage']);
                }
            });

            this.loadExistingImages();
        }
    }

    /**
     * 儲存
     * @returns
     */
    async onSubmit(): Promise<void> {
        if (this.propertyForm.invalid) {
            this.messageService.add({ severity: 'warn', summary: '提醒', detail: '請填寫所有必填欄位' });
            this.propertyForm.markAllAsTouched();
            return;
        }

        if (!this.propertyId) {
            this.messageService.add({ severity: 'error', summary: '錯誤', detail: '無法取得旅館 ID' });
            return;
        }

        if (this.existingImages.length === 0 && this.uploadedImages.length === 0) {
            this.messageService.add({ severity: 'error', summary: '錯誤', detail: '請至少上傳一張旅館圖片' });
            return;
        }

        try {
            // 刪除舊圖片
            if (this.deletedImageIds.length > 0) {
                await new Promise<void>((resolve, reject) => {
                    this.mediaService.deleteMedia({
                        MWHEADER: { MSGID: 'MEDIA-003' },
                        TRANRQ: { mediaIds: this.deletedImageIds }
                    }).subscribe({
                        next: (res) => res.MWHEADER.RETURNCODE === '0000' ? resolve() : reject('刪除圖片失敗'),
                        error: reject
                    });
                });
            }

            // 上傳新圖片
            if (this.uploadedImages.length > 0) {
                await this.uploadAllImages();
            }

            // 更新現有圖片排序
            if (this.existingImages.length > 0) {
                const updatePromises = this.existingImages.map((img) =>
                    new Promise<void>((resolve, reject) => {
                        this.mediaService.updateMedia({
                            MWHEADER: { MSGID: 'MEDIA-002' },
                            TRANRQ: {
                                medias: [{ mediaId: img.mediaId, sortOrder: img.sortOrder }]
                            }
                        }).subscribe({
                            next: (res) => res.MWHEADER.RETURNCODE === '0000' ? resolve() : reject('更新圖片排序失敗'),
                            error: reject
                        });
                    })
                );
                await Promise.all(updatePromises);
            }

            // 送出旅館資料
            const selectedFacilitiesValue = this.propertyForm.controls['selectedFacilities'].value;
            const facilityIds = selectedFacilitiesValue.map(
                (facility: { facilityId: any }) => facility.facilityId
            );
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
                facilities: facilityIds,
                propertyImages: this.existingImages.map(img => ({
                    mediaId: img.mediaId,
                    sortOrder: img.sortOrder
                }))
            };

            this.merchService.editHotelDetail(tranrq).subscribe({
                next: (res) => {
                    if (res.MWHEADER.RETURNCODE === '0000') {
                        this.messageService.add({
                            severity: 'success',
                            summary: '成功',
                            detail: '旅館資料已更新'
                        });
                        this.router.navigate(['/merchants/property/info']);
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: '錯誤',
                            detail: res.MWHEADER.RETURNDESC || '更新失敗'
                        });
                    }
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: '錯誤',
                        detail: '旅館資料更新失敗'
                    });
                }
            });

        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: '錯誤',
                detail: error.message || '處理圖片失敗，請稍後再試'
            });
        }
    }

    /**
     * 刪除確認視窗
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
     * 放棄刪除的繼續編輯
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
     * 縣市別更改
     * @param city
     */
    onCityChange(city: string): void {
        this.propertyForm.controls['city'].setValue(city);
        this.avaliableDistrict = this.rawList
            .filter(o => o.city === city)
            .map(o => o.district);
        this.propertyForm.controls['district'].setValue('');
    }

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
                }
            },
            error: () => {}
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
     * 移除現有圖片
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
