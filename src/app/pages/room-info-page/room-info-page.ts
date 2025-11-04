import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { MerchService } from '../../core/services/merch-service';
import { MediaService } from '../../core/services/media.service';
import { MERCH012Tranrs } from '../../core/interfaces/MERCH012Res.interface';

interface PetTypeOption {
  name: string;
  id: string;
}

interface RoomImage {
  mediaId: string;
  sortOrder: number;
  base64Data: string;
  fileName: string;
}

@Component({
  selector: 'app-room-info-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-info-page.html',
  styleUrl: './room-info-page.css',
  encapsulation: ViewEncapsulation.None
})
export class RoomInfoPage implements OnInit {
  /** petTypes - 寵物種類列表 */
  petTypes: PetTypeOption[] = [
    { name: '貓', id: 'W001' },
    { name: '迷你犬', id: 'W002' },
    { name: '小型犬', id: 'W003' },
    { name: '中型犬', id: 'W004' },
    { name: '大型犬', id: 'W005' },
    { name: '超大型犬', id: 'W006' }
  ];

  /** isLoading */
  isLoading: boolean = false;

  /** errorMessage */
  errorMessage: string = '';

  /** roomData - 儲存從 API 取得的房型資料 */
  roomData: MERCH012Tranrs | null = null;

  /** roomId */
  roomId: string = '';

  /** roomImages - 儲存房型圖片 */
  roomImages: RoomImage[] = [];

  /** isLoadingImages - 圖片載入狀態 */
  isLoadingImages: boolean = false;

  /**
   * 注入
   */
  constructor(
    private merchService: MerchService,
    private mediaService: MediaService,
    private router: Router
  ) {
    // 從 router state 取得房型 ID
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.roomId = navigation.extras.state['roomId'] || '';
      console.log('接收到的房型 ID:', this.roomId);
    }
  }

  /**
   * 初始化
   */
  ngOnInit(): void {
    // 檢查是否有房型 ID
    if (!this.roomId) {
      console.warn('缺少房型 ID，導回首頁');
      this.errorMessage = '無法取得房型資料';
      setTimeout(() => {
        this.router.navigate(['/merchants/property/homepage']);
      }, 2000);
      return;
    }

    // 載入房型資料
    this.loadRoomData();
  }

  /**
   * 載入房型資料
   */
  private loadRoomData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('準備呼叫 API，房型 ID:', this.roomId);

    const tranrq = {
      id: this.roomId
    };

    this.merchService.getRoomDetail(tranrq).subscribe({
      next: (res) => {
        console.log('API 回應:', res);

        if (res.MWHEADER.RETURNCODE === '0000') {
          this.roomData = res.TRANRS;
          console.log('取得的房型資料:', this.roomData);
          // 載入房型圖片
          this.loadRoomImages();
        } else {
          this.errorMessage = '載入房型資料失敗';
          this.roomData = null;
          console.error('API 回傳錯誤:', res.MWHEADER);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('載入房型資料失敗', err);
        this.errorMessage = '無法載入房型資料，請檢查網路連線';
        this.roomData = null;
        this.isLoading = false;
      }
    });
  }

  /**
   * 載入房型圖片
   */
  private loadRoomImages(): void {
    if (!this.roomId) return;

    this.isLoadingImages = true;

    this.mediaService.onGetMediaApi({
      MWHEADER: { MSGID: 'MEDIA-004' },
      TRANRQ: { roomId: this.roomId }
    }).subscribe({
      next: (res) => {
        console.log('圖片 API 回應:', res);

        if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS.medias) {
          this.roomImages = res.TRANRS.medias
            .map(media => ({
              mediaId: media.mediaId,
              sortOrder: media.sortOrder || 0,
              base64Data: media.base64Data,
              fileName: media.fileName
            }))
            .sort((a, b) => a.sortOrder - b.sortOrder);

          console.log('已載入房型圖片:', this.roomImages.length, '張');
        } else {
          console.warn('沒有圖片資料或載入失敗');
          this.roomImages = [];
        }
        this.isLoadingImages = false;
      },
      error: (err) => {
        console.error('載入房型圖片失敗', err);
        this.roomImages = [];
        this.isLoadingImages = false;
      }
    });
  }

  /**
   * 取得圖片的 Base64 URL
   */
  getImageUrl(image: RoomImage): string {
    return `data:image/jpeg;base64,${image.base64Data}`;
  }

  /**
   * 取得寵物種類名稱
   */
  getPetTypeName(): string {
    if (!this.roomData?.petTypeId) return '未知寵物';
    const petType = this.petTypes.find(pt => pt.id === this.roomData!.petTypeId);
    return petType?.name || '未知寵物';
  }

  /**
   * 格式化房間尺寸
   */
  formatRoomSize(): string {
    if (!this.roomData?.roomSize) return '未提供';

    const sizes = this.roomData.roomSize.split('x');
    if (sizes.length !== 3) return this.roomData.roomSize;

    const [height, length, width] = sizes;
    return `高 ${height} cm x 長 ${length} cm x 寬 ${width} cm`;
  }

  /**
   * 取得格式化的房間介紹
   */
  getFormattedDescription(): string {
    if (!this.roomData?.info) return '暫無房間介紹';
    return this.roomData.info.replace(/\n/g, '<br>');
  }

  /**
   * 返回列表
   */
  onBack(): void {
    this.router.navigate(['/merchants/property/homepage']);
  }

  /**
   * 修改房型
   */
  onEdit(): void {
    if (!this.roomData || !this.roomId) {
      this.errorMessage = '無法取得房型資料';
      return;
    }

    const roomForEdit = {
      id: this.roomId,
      ...this.roomData,
      propertyId: (this.roomData as any).propertyId || 'P000000001'
    };

    console.log('導航到修改頁面，傳遞資料:', roomForEdit);

    this.router.navigate(['/merchants/property/roomInfo/edit'], {
      state: { room: roomForEdit }
    });
  }
}