import { MediaService } from './../../core/services/media.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { forkJoin } from 'rxjs';
import { HotelService } from '../../core/services/hotel-service';
import { Router } from '@angular/router';
import { HOTEL002Tranrs } from '../../core/interfaces/HOTEL002Res.interface';
import { HOTEL004Tranrs } from '../../core/interfaces/HOTEL004Res.interface';
import { PropertyStateService } from '../../core/services/property-state.service';

@Component({
    selector: 'app-merchant-property-info-page',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
    templateUrl: './merchant-property-info-page.html',
    styleUrls: ['./merchant-property-info-page.css']
})
export class MerchantPropertyInfoPage implements OnInit {
    /** isLoading */
    isLoading: boolean = false;

    /** errorMessage */
    errorMessage: string = '';

    /** propertyData */
    propertyData: HOTEL002Tranrs | null = null;

    /** facilityData */
    facilityData: HOTEL004Tranrs | null = null;

    /** propertyId */
    propertyId: string = '';

    /** hotel */
    hotel: any = {
        name: '',
        businessCode: '',
        bankAccount: '',
        tel: '',
        address: '',
        info: '',
        checkNotice: '',
        petNotice: '',
        propertyNotice: '',
        propertyImages: [],
        facilities: []
    };

    /**
     * 注入
     */
    constructor(
        private hotelService: HotelService,
        private router: Router,
        private propertyStateService: PropertyStateService,
        private mediaService: MediaService
    ) {
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras?.state && navigation.extras.state['propertyId']) {
            this.propertyId = navigation.extras.state['propertyId'];
            this.propertyStateService.setCurrentPropertyId(this.propertyId);
            console.log('從 router state 接收到的旅館 ID:', this.propertyId);
        } else {
            this.propertyId = this.propertyStateService.getCurrentPropertyId();
            console.log('從 PropertyStateService 取得的旅館 ID:', this.propertyId);
        }
    }

    /**
     * 初始化
     */
    ngOnInit(): void {
        if (!this.propertyId) {
            console.warn('缺少旅館 ID，導回商家會員頁');
            this.errorMessage = '無法取得旅館資料';
            this.router.navigate(['/merchants/userPage']);
            ;
            return;
        }

        // 載入旅館資料
        this.loadPropertyData();
    }

    /**
     * 載入旅館資料
     */
    private loadPropertyData(): void {
        this.isLoading = true;
        this.errorMessage = '';

        console.log('準備呼叫 API，旅館 ID:', this.propertyId);

        // 使用 forkJoin 同時呼叫兩個 API
        forkJoin({
            hotelDetail: this.hotelService.queryHotelDetail(this.propertyId),
            hotelFacilities: this.hotelService.queryHotelFacilities(this.propertyId)
        }).subscribe({
            next: (results) => {
                console.log('HOTEL002 回應:', results.hotelDetail);
                console.log('HOTEL004 回應:', results.hotelFacilities);

                const detailSuccess = results.hotelDetail.MWHEADER.RETURNCODE === '0000';
                const facilitySuccess = results.hotelFacilities.MWHEADER.RETURNCODE === '0000';

                if (detailSuccess && facilitySuccess) {
                    this.propertyData = results.hotelDetail.TRANRS;
                    this.facilityData = results.hotelFacilities.TRANRS;

                    this.updateHotelData();

                    console.log('取得的旅館資料:', this.propertyData);
                    console.log('取得的設施資料:', this.facilityData);
                } else {
                    this.errorMessage = '載入旅館資料失敗';
                    this.propertyData = null;
                    this.facilityData = null;
                    console.error('API 回傳錯誤:', {
                        detail: results.hotelDetail.MWHEADER,
                        facility: results.hotelFacilities.MWHEADER
                    });
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('載入旅館資料失敗', err);
                this.errorMessage = '無法載入旅館資料，請檢查網路連線';
                this.propertyData = null;
                this.facilityData = null;
                this.isLoading = false;
            }
        });
    }

    /**
     * 更新 hotel 物件資料
     */
    private updateHotelData(): void {
        if (this.propertyData && this.propertyData.property_details && this.propertyData.property_details.length > 0) {
            const detail = this.propertyData.property_details[0];

            this.hotel = {
                name: detail.name || '',
                businessCode: detail.businessCode || '',
                bankAccount: detail.bankAccount || '',
                tel: detail.tel || '',
                address: detail.address || '',
                info: detail.info || '',
                checkNotice: detail.checkNotice || '',
                petNotice: detail.petNotice || '',
                propertyNotice: detail.propertyNotice || '',
                propertyImages: [],
                facilities: this.facilityData?.facilities.map(f => ({ facilityName: f.name })) || []
            };

            this.mediaService.onGetMediaApi({
                MWHEADER: {
                    MSGID: 'MEDIA-004'
                },
                TRANRQ: {
                    propertyId: this.propertyId
                }
            }).subscribe({
                next: (response) => {
                    if (!(response.MWHEADER.RETURNCODE === "0000") || !response.TRANRS.totalCount) {
                        return;
                    }
                    this.hotel.propertyImages = response.TRANRS.medias;
                },
                error: (error) => {
                    return;
                }
            });

            if (detail.name) {
                this.propertyStateService.setCurrentPropertyName(detail.name);
            }

            console.log('已更新 hotel 物件:', this.hotel);
        }
    }

    /**
     * 返回商家會員頁
     */
    onBack() {
        this.router.navigate(['/merchants/userPage']);
    }

    /**
     * 前往編輯頁面
     */
    onEdit() {
        if (!this.propertyData || !this.propertyId) {
            this.errorMessage = '無法取得旅館資料';
            return;
        }

        const detail = this.propertyData.property_details[0];

        const propertyForEdit = {
            id: this.propertyId,
            ...detail
        };

        console.log('導航到編輯頁面，傳遞資料:', propertyForEdit);
        this.router.navigate(['/merchants/property/edit'], { state: { property: propertyForEdit } });
    }
}
