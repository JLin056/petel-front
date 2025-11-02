import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MerchService } from '../../core/services/merch-service';
import { MediaService } from '../../core/services/media.service';
import { PropertyStateService } from '../../core/services/property-state.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-merchant-home-page',
  imports: [CommonModule, SharedConfirmDialog],
  templateUrl: './merchant-home-page.html',
  styleUrl: './merchant-home-page.css'
})
export class MerchantHomePage implements OnInit, OnDestroy {
  /** deleteRoomVisible */
  deleteRoomVisible = false;
  /** roomToDelete */
  roomToDelete: any = null;
  /** propertyId */
  propertyId: string = '';
  /** roomList */
  roomList: any[] = [];
  /** roomImages */
  roomImages: { [roomId: string]: string } = {};
  /** navigationSubscription */
  private navigationSubscription?: Subscription;
  /** queryParamsSubscription */
  private queryParamsSubscription?: Subscription;
  /** stats 先寫死*/
  stats: Stat[] = [
    { label: '營業額', value: '$55,000', change: '+10% (較上月)', icon: 'pi pi-chart-line', color: '#b7a298' },
    { label: '預約數', value: '45', change: '+8% (較上月)', icon: 'pi pi-book', color: '#b7a298' },
    { label: '平均評價', value: '4.8/5', change: '+0.3 (較上月)', icon: 'pi pi-star-fill', color: '#b7a298' },
    { label: '取消率', value: '5%', change: '-1% (較上月)', icon: 'pi pi-times-circle', color: '#b7a298' }
  ];
  /** isLoading */
  isLoading = false;
  /** isDeleting */
  isDeleting = false;

  private petTypeMap: { [key: string]: string } = {
    'W001': '貓',
    'W002': '迷你犬',
    'W003': '小型犬',
    'W004': '中型犬',
    'W005': '大型犬',
    'W006': '超大型犬'
  };

  /**
   * 注入
   * @param router
   * @param route
   * @param merchService
   * @param mediaService
   * @param propertyStateService
   */
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private merchService: MerchService,
    private mediaService: MediaService,
    private propertyStateService: PropertyStateService
  ) { }

  ngOnInit(): void {
    this.propertyId = this.propertyStateService.getCurrentPropertyId();

    if (!this.propertyId) {
      console.error('PropertyId 未設定');
      return;
    }

    console.log('商家首頁取得的 propertyId:', this.propertyId);
    this.loadRooms();

    // 監聽 queryParams 變化（當從編輯頁面帶 refresh 參數回來時觸發）
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      if (params['refresh']) {
        console.log('🔄 偵測到 refresh 參數，強制重新載入房型和圖片');
        console.log('🔗 Refresh 時間戳:', params['refresh']);
        // 清除所有快取的圖片
        this.roomImages = {};
        // 重新載入房型列表和圖片
        this.loadRooms();
      }
    });

    // 監聽路由變化（作為備用機制）
    this.navigationSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url.includes('/merchants/property/homepage')) {
          console.log('🔄 導航回首頁，強制重新載入房型和圖片資料');
          console.log('🔗 導航 URL:', event.url);
          // 清除所有快取的圖片
          this.roomImages = {};
          // 重新載入房型列表和圖片
          this.loadRooms();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  /**
   * 載入房間列表
   */
  loadRooms(): void {
    this.isLoading = true;

    const tranrq = {
      propertyId: this.propertyId
    };

    this.merchService.queryPropertyRooms(tranrq).subscribe({
      next: (res) => {
        console.log('API 回應:', res);

        if (res.MWHEADER.RETURNCODE === '0000') {
          this.roomList = (res.TRANRS?.rooms || []).map((room: any) => ({
            ...room,
            petTypeName: this.petTypeMap[room.petTypeId],
            formattedRoomSize: this.formatRoomSize(room.roomSize)
          }));
          this.stats = res.TRANRS?.stats?.length > 0 ? res.TRANRS.stats : this.stats;
          console.log('房間列表載入成功', this.roomList);

          this.loadRoomImages();
        } else {
          this.roomList = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('載入房間列表失敗', err);
        this.isLoading = false;
        this.roomList = [];
      }
    });
  }

  /**
   * 格式化房間尺寸
   * 將 "100x200x300" 轉換成 "100公分 x 200公分 x 300公分"
   * @param roomSize 原始尺寸字串
   * @returns 格式化後的尺寸字串
   */
  private formatRoomSize(roomSize: string): string {
    if (!roomSize) return '';

    const sizes = roomSize.split('x');
    if (sizes.length !== 3) return roomSize; 

    const [height, length, width] = sizes;
    return `${height}cm x ${length}cm x ${width}cm`;
  }

  /**
   * 載入所有房型的封面圖片
   */
  private loadRoomImages(): void {
    console.log('🖼️ 開始載入所有房型的封面圖片...');
    this.roomList.forEach(room => {
      if (room.id) {
        console.log(`📤 發送 MEDIA-004 請求，房型 ID: ${room.id}`);
        this.mediaService.onGetMediaApi({
          MWHEADER: { MSGID: 'MEDIA-004' },
          TRANRQ: { roomId: room.id }
        }).subscribe({
          next: (res) => {
            console.log(`📥 收到房型 ${room.id} 的圖片回應:`, res);

            if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS.medias && res.TRANRS.medias.length > 0) {
              console.log(`✅ 房型 ${room.id} 有 ${res.TRANRS.medias.length} 張圖片`);
              console.log(`📊 原始圖片資料（未排序）:`, res.TRANRS.medias.map(m => ({
                mediaId: m.mediaId,
                sortOrder: m.sortOrder,
                fileName: m.fileName
              })));

              const sortedImages = res.TRANRS.medias.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

              console.log(`📊 排序後的圖片資料:`, sortedImages.map(m => ({
                mediaId: m.mediaId,
                sortOrder: m.sortOrder,
                fileName: m.fileName
              })));

              const firstImage = sortedImages[0];

              console.log(`🎯 房型 ${room.id} 選擇的封面圖（sortOrder 最小）:`, {
                mediaId: firstImage.mediaId,
                sortOrder: firstImage.sortOrder,
                fileName: firstImage.fileName
              });

              this.roomImages[room.id] = `data:image/jpeg;base64,${firstImage.base64Data}`;
              console.log(`✅ 房型 ${room.id} 的封面圖已設定`);
            } else {
              console.warn(`⚠️ 房型 ${room.id} 沒有圖片資料`);
            }
          },
          error: (err) => {
            console.error(`❌ 載入房型 ${room.id} 圖片失敗:`, err);
          }
        });
      }
    });
  }

  /**
   * 取得房型封面圖片
   * @param roomId 房型 ID
   * @returns 圖片 URL 或預設圖片
   */
  getRoomImage(roomId: string): string {
    return this.roomImages[roomId];
  }

  /**
   * 新增房型
   */
  onAdd(): void {
    this.router.navigate(['/merchants/property/roomInfo/insert'])
  }

  /**
   * 修改房型
   * @param room 
   * @returns 
   */
  onEdit(room: any): void {
    if (!room || !room.id) {
      return;
    }
    this.router.navigate(['/merchants/property/roomInfo/edit'], {
      state: { room: room }
    });
  }

  /**
   * 顯示刪除確認對話框
   * @param room 
   */
  showDeleteConfirm(room: any) {
    if (!room || !room.id) {
      return;
    }
    this.roomToDelete = room;
    this.deleteRoomVisible = true;
  }

  /**
   * 刪除
   */
  onDelete() {
    if (!this.roomToDelete || !this.roomToDelete.id) {
      return;
    }
    this.isDeleting = true;

    this.merchService.deleteRoomDetail(this.roomToDelete.id).subscribe({
      next: (res) => {
        console.log('刪除API回應', res);
        if (res.MWHEADER.RETURNCODE === '0000') {
          const index = this.roomList.indexOf(this.roomToDelete);
          if (index > -1) {
            this.roomList.splice(index, 1);
          }
          console.log('已成功刪除房型', this.roomToDelete.name)
          this.roomToDelete = null;
          this.deleteRoomVisible = false;
        } else {
        }
        this.isDeleting = false;
      },
      error: (err) => {
        console.error('刪除失敗', err);
        this.isDeleting = false;
        this.deleteRoomVisible = false;
        this.roomToDelete = null;
      }
    });
  }

  /**
   * 查看房型詳細資料 (點擊卡片主要區域觸發)
   * @param room 
   */
  onDetail(room: any): void {
    console.log('點擊房型詳細資料，完整的 Room 物件:', room); 

    if (!room || !room.id) {
      return;
    }
  
    console.log('導航到詳細頁面，房型 ID:', room.id);

    this.router.navigate(['/merchants/property/roomInfo'], {
      state: {
        roomId: room.id,
      }
    });
  }
}
