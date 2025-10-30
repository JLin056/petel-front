import { Component, OnInit } from '@angular/core';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MerchService } from '../../core/services/merch-service';
import { PropertyStateService } from '../../core/services/property-state.service';
import { HotelService } from '../../core/services/hotel-service';

@Component({
  selector: 'app-merchant-home-page',
  imports: [CommonModule, SharedConfirmDialog],
  templateUrl: './merchant-home-page.html',
  styleUrl: './merchant-home-page.css'
})
export class MerchantHomePage implements OnInit {
  /** deleteRoomVisible */
  deleteRoomVisible = false;
  /** roomToDelete */
  roomToDelete: any = null;
  /** propertyId */
  propertyId: string = ''
  /** roomList */
  roomList: any[] = [];
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
  /** errorMessage */
  errorMessage = '';

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
   * @param merchService
   * @param propertyStateService
   * @param hotelService
   */
  constructor(
    private router: Router,
    private merchService: MerchService,
    private propertyStateService: PropertyStateService,
    private hotelService: HotelService
  ) { }

  ngOnInit(): void {
    this.propertyId = this.propertyStateService.getCurrentPropertyId();

    console.log('=== 旅館首頁初始化 ===');
    console.log('propertyId:', this.propertyId);

    if (!this.propertyId) {
      console.warn('缺少旅館 ID，導回商家會員頁');
      setTimeout(() => {
        this.router.navigate(['/merchants/userPage']);
      }, 2000);
      return;
    }

    this.loadRooms();
    this.loadPropertyName();
  }

  /**
   * 載入旅館名稱
   */
  loadPropertyName(): void {
    this.hotelService.queryHotelDetail(this.propertyId).subscribe({
      next: (res) => {
        if (res.MWHEADER.RETURNCODE === '0000' && res.TRANRS?.property_details?.[0]?.name) {
          const propertyName = res.TRANRS.property_details[0].name;
          this.propertyStateService.setCurrentPropertyName(propertyName);
          console.log('已保存旅館名稱:', propertyName);
        }
      },
      error: (err) => {
        console.error('取得旅館名稱失敗:', err);
      }
    });
  }

  /**
   * 載入房間列表
   */
  loadRooms(): void {
    this.isLoading = true;
    this.errorMessage = '';

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
    this.errorMessage = '';
  }

  /**
   * 刪除
   */
  onDelete() {
    if (!this.roomToDelete || !this.roomToDelete.id) {
      return;
    }
    this.isDeleting = true;
    this.errorMessage = '';

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
      console.error(this.errorMessage, room);
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
