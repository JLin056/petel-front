import { Component } from '@angular/core';
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
export class MerchantPropertyInfoPage {
  /** isLoading */
  isLoading: boolean = false;

  /** errorMessage */
  errorMessage: string = '';

  /** propertyData - 儲存從 API 取得的房型資料 */
  propertyData: HOTEL002Tranrs | null = null;

  /** propertyId */
  propertyId: string = '';

  /**
* 注入
*/
  constructor(
    private hotelService: HotelService,
    private router: Router
  ) {
    // 從 router state 取得房型 ID
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.propertyId = navigation.extras.state['propertyId'] || '';
      console.log('接收到的旅館 ID:', this.propertyId);
    }
  }

  /**
  * 初始化
  */
  ngOnInit(): void {
    // 檢查是否有房型 ID
    if (!this.propertyId) {
      console.warn('缺少旅館 ID，導回首頁');
      this.errorMessage = '無法取得房型資料';
      setTimeout(() => {
        this.router.navigate(['/merchants/userPage']);
      }, 2000);
      return;
    }

    // 載入房型資料
    this.loadPropertyData();
  }

  /**
   * 載入房型資料
   */
  private loadPropertyData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('準備呼叫 API，旅館 ID:', this.propertyId);

    const tranrq = {
      id: this.propertyId
    };

    this.hotelService.queryHotelDetail(this.propertyId).subscribe({
      next: (res) => {
        console.log('API 回應:', res);

        if (res.MWHEADER.RETURNCODE === '0000') {
          this.propertyData = res.TRANRS;
          console.log('取得的旅館資料:', this.propertyData);
        } else {
          this.errorMessage = '載入旅館資料失敗';
          this.propertyData = null;
          console.error('API 回傳錯誤:', res.MWHEADER);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('載入旅館資料失敗', err);
        this.errorMessage = '無法載入旅館資料，請檢查網路連線';
        this.propertyData = null;
        this.isLoading = false;
      }
    });
  }

  hotel = {
    name: '汪星樂園寵物旅館',
    businessCode: 'PET-2025-0088', // 新增欄位
    bankAccount: '123-456-7890123', // 新增欄位
    tel: '02-2233-5566',
    address: '台北市信義區松山路88號',
    info: '提供舒適安全的寵物住宿環境，專為毛孩設計的貼心旅館。',
    checkNotice: '入住時間：15:00 後｜退房時間：11:00 前。',
    petNotice: '入住寵物需攜帶疫苗證明及日常用品。',
    propertyNotice: '旅館內全面禁菸，請勿攜帶外食與危險物品。',
    propertyImages: [
      { base64Data: 'https://picsum.photos/600/300?random=10' },
      { base64Data: 'https://picsum.photos/600/300?random=11' },
      { base64Data: 'https://picsum.photos/600/300?random=12' }
    ],
    facilities: [
      { facilityName: '寵物游泳池' },
      { facilityName: '專屬遊戲區' },
      { facilityName: '24小時監視系統' },
      { facilityName: '寵物美容服務' },
      { facilityName: '免費停車場' }
    ]
  };

  onBack() {
    this.router.navigate(['/merchants/userPage']);
  }

  onEdit() {
    if (!this.propertyData || !this.propertyId) {
      this.errorMessage = '無法取得旅館資料';
      return;
    }

    const propertyForEdit = {
      id: this.propertyId,
      ...this.propertyData,
      propertyId: (this.propertyData as any).propertyId
    };

    this.router.navigate(['/merchants/property/info/edit']);
  }
}