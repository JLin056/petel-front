import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MediaService } from '../../core/services/media.service';
import { MerchService } from '../../core/services/merch-service';
import { PropertyStateService } from '../../core/services/property-state.service';

@Component({
  selector: 'app-merchant-home-page',
  imports: [CommonModule],
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
      return;
    }
    this.loadRooms();
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

        if (res.MWHEADER.RETURNCODE === '0000') {
          this.roomList = (res.TRANRS?.rooms || []).map((room: any) => ({
            ...room,
            petTypeName: this.petTypeMap[room.petTypeId],
            formattedRoomSize: this.formatRoomSize(room.roomSize)
          }));

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
    this.roomList.forEach(room => {
      if (room.id) {
        this.mediaService.onGetMediaApi({
          MWHEADER: { MSGID: 'MEDIA-004' },
          TRANRQ: { roomId: room.id }
        }).subscribe({
          next: (res) => {
            console.log(`📥 收到房型 ${room.id} 的圖片回應:`, res);

            if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS.medias && res.TRANRS.medias.length > 0) {

              const sortedImages = res.TRANRS.medias.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
              const firstImage = res.TRANRS.medias.find(m => m.sortOrder === 1) || sortedImages[0];
              this.roomImages[room.id] = `data:image/jpeg;base64,${firstImage.base64Data}`;
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
   * 查看房型詳細資料 
   * @param room 
   */
  onDetail(room: any): void {
    if (!room || !room.id) {
      return;
    }
    this.router.navigate(['/merchants/property/roomInfo'], {
      state: {
        roomId: room.id,
      }
    });
  }
}
