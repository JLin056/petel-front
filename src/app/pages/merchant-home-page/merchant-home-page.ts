import { Component, OnInit } from '@angular/core';
import { SharedConfirmDialog } from '../shared-confirm-dialog/shared-confirm-dialog';
import { Router } from '@angular/router';
import { MerchService } from '../../core/services/merch-service';
import { CommonModule } from '@angular/common';

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
  // propertyId: string = '';
  propertyId: string = 'P000000001'
  /** roomList */
  roomList: any[] = [];
  /** stats 先寫死*/
  stats: Stat[] = [
    { label: '本月營業額', value: '$55,000', change: '+10% (較上月)', icon: 'pi pi-chart-line', color: '#b7a298' },
    { label: '本月預約數', value: '45', change: '+8% (較上月)', icon: 'pi pi-book', color: '#b7a298' },
    { label: '本月平均評價', value: '4.8/5', change: '+0.3 (較上月)', icon: 'pi pi-star-fill', color: '#b7a298' },
    { label: '本月取消率', value: '5%', change: '-1% (較上月)', icon: 'pi pi-times-circle', color: '#b7a298' }
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
   */
  constructor(private router: Router, private merchService: MerchService) { }

  ngOnInit(): void {
    this.loadRooms();
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
          // 如果 API 沒有返回 stats 數據，或返回空陣列，則保留預設值
          this.roomList = (res.TRANRS?.rooms || []).map((room: any) => ({
            ...room,
            // 轉換 petTypeId 成 petTypeName
            petTypeName: this.petTypeMap[room.petTypeId] || '未知寵物'
          }));
          this.stats = res.TRANRS?.stats?.length > 0 ? res.TRANRS.stats : this.stats; // 如果API有返回，則使用API數據，否則保持預設
          console.log('房間列表載入成功', this.roomList);
        } else {
          this.errorMessage = '載入房型列表失敗';
          this.roomList = [];
          // *** 確保這裡即使失敗也保留預設 stats ***
          // this.stats = []; // 移除這行，保持預設值
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('載入房間列表失敗', err);
        this.errorMessage = '無法載入房型列表，請稍後再試';
        this.isLoading = false;
        this.roomList = [];
        // *** 確保這裡即使失敗也保留預設 stats ***
        // this.stats = []; // 移除這行，保持預設值
      }
    });
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
      this.errorMessage = '無法取得房型資料';
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
      this.errorMessage = '無法取得房型，請稍後再試';
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
      this.errorMessage = '無法取得房型，請稍後再試';
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
        } else {
          this.errorMessage = '刪除失敗';
        }
        this.isDeleting = false;
      },
      error: (err) => {
        console.error('刪除失敗', err);
        this.errorMessage = err.error?.TRANRS?.message || '刪除房型時發生錯誤，請稍後再試';
        this.isDeleting = false;
        this.deleteRoomVisible = false;
        this.roomToDelete = null;
      }
    });
  }
}

